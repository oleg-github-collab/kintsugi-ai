package chat

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	containertypes "github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CodeExecutionService struct {
	db           *gorm.DB
	dockerClient *client.Client
}

const (
	// Execution constraints
	executionTimeout = 30 * time.Second
	memoryLimit      = 256 * 1024 * 1024 // 256MB in bytes

	// Docker images
	pythonImage     = "python:3.11-alpine"
	javascriptImage = "node:20-alpine"
)

func NewCodeExecutionService(db *gorm.DB) (*CodeExecutionService, error) {
	// Initialize Docker client
	dockerClient, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, fmt.Errorf("failed to create Docker client: %w", err)
	}

	return &CodeExecutionService{
		db:           db,
		dockerClient: dockerClient,
	}, nil
}

func (s *CodeExecutionService) Close() error {
	if s.dockerClient != nil {
		return s.dockerClient.Close()
	}
	return nil
}

func (s *CodeExecutionService) ExecutePythonCode(userID uuid.UUID, code string, chatID *uuid.UUID) (*CodeExecution, error) {
	return s.executeCode(userID, "python", code, chatID)
}

func (s *CodeExecutionService) ExecuteJavaScriptCode(userID uuid.UUID, code string, chatID *uuid.UUID) (*CodeExecution, error) {
	return s.executeCode(userID, "javascript", code, chatID)
}

func (s *CodeExecutionService) executeCode(userID uuid.UUID, language, code string, chatID *uuid.UUID) (*CodeExecution, error) {
	// Validate input
	if strings.TrimSpace(code) == "" {
		return nil, errors.New("code is required")
	}

	// Create execution record
	execution := &CodeExecution{
		UserID:   userID,
		Language: language,
		Code:     code,
		Status:   "pending",
	}

	if chatID != nil {
		execution.ChatID = *chatID
	}

	if err := s.db.Create(execution).Error; err != nil {
		return nil, err
	}

	// Execute in background
	go s.runCodeInDocker(execution)

	return execution, nil
}

func (s *CodeExecutionService) runCodeInDocker(execution *CodeExecution) {
	// Update status to running
	execution.Status = "running"
	s.db.Save(execution)

	ctx, cancel := context.WithTimeout(context.Background(), executionTimeout)
	defer cancel()

	var output, errOutput string
	var err error

	switch execution.Language {
	case "python":
		output, errOutput, err = s.runPython(ctx, execution.Code)
	case "javascript":
		output, errOutput, err = s.runJavaScript(ctx, execution.Code)
	default:
		err = errors.New("unsupported language")
	}

	// Update execution record
	execution.ExecutedAt = time.Now()

	if err != nil {
		execution.Status = "failed"
		execution.Error = err.Error()
		if errOutput != "" {
			execution.Error += "\n" + errOutput
		}
	} else {
		execution.Status = "completed"
		execution.Output = output
		if errOutput != "" {
			execution.Error = errOutput
		}
	}

	s.db.Save(execution)
}

func (s *CodeExecutionService) runPython(ctx context.Context, code string) (string, string, error) {
	// Create container config
	containerConfig := &containertypes.Config{
		Image:        pythonImage,
		Cmd:          []string{"python", "-c", code},
		AttachStdout: true,
		AttachStderr: true,
		Tty:          false,
	}

	hostConfig := &containertypes.HostConfig{
		Resources: containertypes.Resources{
			Memory:     memoryLimit,
			NanoCPUs:   1000000000, // 1 CPU
		},
		NetworkMode: "none", // No network access for security
		AutoRemove:  true,   // Auto-remove container after execution
	}

	return s.executeInContainer(ctx, containerConfig, hostConfig)
}

func (s *CodeExecutionService) runJavaScript(ctx context.Context, code string) (string, string, error) {
	// Create container config
	containerConfig := &containertypes.Config{
		Image:        javascriptImage,
		Cmd:          []string{"node", "-e", code},
		AttachStdout: true,
		AttachStderr: true,
		Tty:          false,
	}

	hostConfig := &containertypes.HostConfig{
		Resources: containertypes.Resources{
			Memory:     memoryLimit,
			NanoCPUs:   1000000000, // 1 CPU
		},
		NetworkMode: "none", // No network access for security
		AutoRemove:  true,   // Auto-remove container after execution
	}

	return s.executeInContainer(ctx, containerConfig, hostConfig)
}

func (s *CodeExecutionService) executeInContainer(ctx context.Context, containerConfig *containertypes.Config, hostConfig *containertypes.HostConfig) (string, string, error) {
	// Create container
	resp, err := s.dockerClient.ContainerCreate(ctx, containerConfig, hostConfig, nil, nil, "")
	if err != nil {
		return "", "", fmt.Errorf("failed to create container: %w", err)
	}

	containerID := resp.ID

	// Start container
	if err := s.dockerClient.ContainerStart(ctx, containerID, containertypes.StartOptions{}); err != nil {
		return "", "", fmt.Errorf("failed to start container: %w", err)
	}

	// Wait for container to finish or timeout
	statusCh, errCh := s.dockerClient.ContainerWait(ctx, containerID, containertypes.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			return "", "", fmt.Errorf("container wait error: %w", err)
		}
	case <-statusCh:
		// Container finished
	case <-ctx.Done():
		// Timeout - stop and remove container
		timeout := 5
		s.dockerClient.ContainerStop(context.Background(), containerID, containertypes.StopOptions{Timeout: &timeout})
		return "", "", errors.New("execution timeout exceeded")
	}

	// Get logs
	logs, err := s.dockerClient.ContainerLogs(ctx, containerID, containertypes.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Timestamps: false,
	})
	if err != nil {
		return "", "", fmt.Errorf("failed to get logs: %w", err)
	}
	defer logs.Close()

	// Read logs
	buf := new(strings.Builder)
	errBuf := new(strings.Builder)

	// Docker logs format: first 8 bytes are header, rest is content
	// Header: [STREAM_TYPE, 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4]
	buffer := make([]byte, 8192)
	for {
		n, err := logs.Read(buffer)
		if n > 0 {
			// Skip first 8 bytes (header) and read the rest
			if n > 8 {
				streamType := buffer[0]
				content := string(buffer[8:n])

				if streamType == 1 { // stdout
					buf.WriteString(content)
				} else if streamType == 2 { // stderr
					errBuf.WriteString(content)
				}
			}
		}
		if err != nil {
			break
		}
	}

	return buf.String(), errBuf.String(), nil
}

func (s *CodeExecutionService) GetExecution(executionID, userID uuid.UUID) (*CodeExecution, error) {
	var execution CodeExecution
	err := s.db.Where("id = ? AND user_id = ?", executionID, userID).First(&execution).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("execution not found")
		}
		return nil, err
	}

	return &execution, nil
}

func (s *CodeExecutionService) GetUserExecutions(userID uuid.UUID, limit, offset int) ([]CodeExecution, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	var executions []CodeExecution
	err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&executions).Error

	if err != nil {
		return nil, err
	}

	return executions, nil
}

func (s *CodeExecutionService) GetChatExecutions(chatID, userID uuid.UUID) ([]CodeExecution, error) {
	var executions []CodeExecution
	err := s.db.Where("chat_id = ? AND user_id = ?", chatID, userID).
		Order("created_at DESC").
		Find(&executions).Error

	if err != nil {
		return nil, err
	}

	return executions, nil
}

func (s *CodeExecutionService) DeleteExecution(executionID, userID uuid.UUID) error {
	result := s.db.Where("id = ? AND user_id = ?", executionID, userID).Delete(&CodeExecution{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("execution not found")
	}

	return nil
}
