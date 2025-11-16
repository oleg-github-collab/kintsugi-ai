// Code Execution - Kintsugi AI
// Sandbox execution for Python and JavaScript

const CodeExecution = {
    executions: [],
    currentLanguage: 'python',

    // Initialize
    init: function() {
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Will be set up dynamically
    },

    // Execute code
    executeCode: async function(code, language = 'python', chatId = null) {
        try {
            const token = getToken();
            if (!token) {
                if (window.ChatEnhanced) {
                    ChatEnhanced.showNotification('❌ Not authenticated', 'error');
                }
                return null;
            }

            const response = await fetch(`${API_URL}/chat/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    language: language,
                    code: code,
                    chat_id: chatId
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    removeToken();
                    window.location.href = '/login.html';
                    return null;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.execution;
        } catch (error) {
            console.error('[CODE_EXEC] Execute error:', error);
            if (window.ChatEnhanced) {
                ChatEnhanced.showNotification('❌ Execution failed', 'error');
            }
            return null;
        }
    },

    // Get execution status
    getExecution: async function(executionId) {
        try {
            const token = getToken();
            if (!token) return null;

            const response = await fetch(`${API_URL}/chat/execute/${executionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return data.execution;
        } catch (error) {
            console.error('[CODE_EXEC] Get execution error:', error);
            return null;
        }
    },

    // Poll execution status until complete
    pollExecution: async function(executionId, callback) {
        const maxAttempts = 60; // 60 seconds max
        let attempts = 0;

        const poll = async () => {
            attempts++;
            const execution = await this.getExecution(executionId);

            if (execution) {
                if (execution.status === 'completed' || execution.status === 'failed') {
                    callback(execution);
                    return;
                }
            }

            if (attempts < maxAttempts) {
                setTimeout(poll, 1000);
            } else {
                callback({ status: 'timeout', error: 'Execution timeout' });
            }
        };

        poll();
    },

    // Show code execution modal
    showExecutionModal: function(initialCode = '', language = 'python') {
        this.currentLanguage = language;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content border-3 border-cyan" style="max-width: 900px; background: var(--digital-black); padding: 2rem; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 class="text-cyan text-neon" style="font-size: 1.5rem;">CODE EXECUTION</h3>
                    <button onclick="CodeExecution.closeModal()" style="background: none; border: none; color: var(--neon-pink); cursor: pointer; font-size: 1.5rem;">✕</button>
                </div>

                <!-- Language Selection -->
                <div style="margin-bottom: 1.5rem; display: flex; gap: 1rem;">
                    <button
                        class="lang-btn ${language === 'python' ? 'active' : ''}"
                        onclick="CodeExecution.selectLanguage('python')"
                        style="flex: 1; padding: 0.75rem; border: 2px solid ${language === 'python' ? 'var(--cyber-cyan)' : '#333'}; background: ${language === 'python' ? 'rgba(0, 255, 255, 0.1)' : 'transparent'}; color: var(--cyber-cyan); cursor: pointer; transition: all 0.2s;"
                    >
                        🐍 PYTHON
                    </button>
                    <button
                        class="lang-btn ${language === 'javascript' ? 'active' : ''}"
                        onclick="CodeExecution.selectLanguage('javascript')"
                        style="flex: 1; padding: 0.75rem; border: 2px solid ${language === 'javascript' ? 'var(--kintsugi-gold)' : '#333'}; background: ${language === 'javascript' ? 'rgba(240, 255, 0, 0.1)' : 'transparent'}; color: var(--kintsugi-gold); cursor: pointer; transition: all 0.2s;"
                    >
                        ⚡ JAVASCRIPT
                    </button>
                </div>

                <!-- Code Editor -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; color: var(--cyber-cyan); margin-bottom: 0.5rem; font-weight: bold;">CODE</label>
                    <textarea
                        id="code-editor-textarea"
                        class="form-input"
                        style="width: 100%; padding: 1rem; min-height: 300px; font-family: 'Courier New', monospace; font-size: 0.95rem; background: #0a0a0a; color: #00FF00; border: 2px solid var(--cyber-cyan);"
                        placeholder="# Write your ${language} code here..."
                    >${initialCode}</textarea>
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; color: #666; font-size: 0.85rem;">
                        <span id="code-char-count">0 chars</span>
                        <span>⚠️ Code runs in isolated sandbox (30s timeout, 256MB RAM)</span>
                    </div>
                </div>

                <!-- Output Area -->
                <div id="execution-output-area" style="display: none; margin-bottom: 1.5rem;">
                    <label style="display: block; color: var(--kintsugi-gold); margin-bottom: 0.5rem; font-weight: bold;">OUTPUT</label>
                    <div id="execution-output" class="border-3 border-gold" style="padding: 1rem; background: rgba(240, 255, 0, 0.05); min-height: 100px; max-height: 300px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 0.9rem; white-space: pre-wrap;"></div>
                </div>

                <div id="execution-error-area" style="display: none; margin-bottom: 1.5rem;">
                    <label style="display: block; color: var(--neon-pink); margin-bottom: 0.5rem; font-weight: bold;">ERROR</label>
                    <div id="execution-error" class="border-3 border-pink" style="padding: 1rem; background: rgba(255, 0, 255, 0.05); max-height: 200px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 0.9rem; white-space: pre-wrap; color: var(--neon-pink);"></div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 1rem; justify-content: space-between;">
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="CodeExecution.clearEditor()" class="btn btn-secondary interactive" style="padding: 0.75rem 1rem;">
                            🗑️ CLEAR
                        </button>
                        <button onclick="CodeExecution.loadExample()" class="btn btn-secondary interactive" style="padding: 0.75rem 1rem;">
                            💡 EXAMPLE
                        </button>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button onclick="CodeExecution.closeModal()" class="btn btn-secondary interactive" style="padding: 0.75rem 1.5rem;">
                            CANCEL
                        </button>
                        <button id="execute-btn" onclick="CodeExecution.runCode()" class="btn btn-primary interactive" style="padding: 0.75rem 2rem; background: linear-gradient(135deg, var(--matrix-green), var(--cyber-cyan)); color: var(--digital-black); font-weight: bold;">
                            ▶ RUN CODE
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Setup character counter
        const textarea = document.getElementById('code-editor-textarea');
        const charCount = document.getElementById('code-char-count');
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length + ' chars';
        });
        charCount.textContent = textarea.value.length + ' chars';
    },

    // Select language
    selectLanguage: function(language) {
        this.currentLanguage = language;
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(language)) {
                btn.style.border = language === 'python' ? '2px solid var(--cyber-cyan)' : '2px solid var(--kintsugi-gold)';
                btn.style.background = language === 'python' ? 'rgba(0, 255, 255, 0.1)' : 'rgba(240, 255, 0, 0.1)';
            } else {
                btn.style.border = '2px solid #333';
                btn.style.background = 'transparent';
            }
        });

        const placeholder = document.getElementById('code-editor-textarea');
        if (placeholder) {
            placeholder.placeholder = `# Write your ${language} code here...`;
        }
    },

    // Run code
    runCode: async function() {
        const code = document.getElementById('code-editor-textarea').value.trim();
        if (!code) {
            alert('Please enter some code to execute');
            return;
        }

        const executeBtn = document.getElementById('execute-btn');
        const originalText = executeBtn.innerHTML;
        executeBtn.disabled = true;
        executeBtn.innerHTML = '⏳ EXECUTING...';

        // Clear previous output
        document.getElementById('execution-output-area').style.display = 'none';
        document.getElementById('execution-error-area').style.display = 'none';
        document.getElementById('execution-output').textContent = '';
        document.getElementById('execution-error').textContent = '';

        // Get current chat ID if available
        const chatId = window.ChatEnhanced ? ChatEnhanced.currentChatId : null;

        // Execute code
        const execution = await this.executeCode(code, this.currentLanguage, chatId);

        if (!execution) {
            executeBtn.disabled = false;
            executeBtn.innerHTML = originalText;
            document.getElementById('execution-error-area').style.display = 'block';
            document.getElementById('execution-error').textContent = 'Failed to start execution. Please try again.';
            return;
        }

        // Poll for results
        this.pollExecution(execution.id, (result) => {
            executeBtn.disabled = false;
            executeBtn.innerHTML = originalText;

            if (result.status === 'completed') {
                if (result.output) {
                    document.getElementById('execution-output-area').style.display = 'block';
                    document.getElementById('execution-output').textContent = result.output;
                }
                if (result.error) {
                    document.getElementById('execution-error-area').style.display = 'block';
                    document.getElementById('execution-error').textContent = result.error;
                }
                if (!result.output && !result.error) {
                    document.getElementById('execution-output-area').style.display = 'block';
                    document.getElementById('execution-output').textContent = '(no output)';
                }

                if (window.ChatEnhanced) {
                    ChatEnhanced.showNotification('✓ Code executed successfully!', 'success');
                }
            } else if (result.status === 'failed' || result.status === 'timeout') {
                document.getElementById('execution-error-area').style.display = 'block';
                document.getElementById('execution-error').textContent = result.error || 'Execution failed or timed out';

                if (window.ChatEnhanced) {
                    ChatEnhanced.showNotification('❌ Code execution failed', 'error');
                }
            }
        });
    },

    // Clear editor
    clearEditor: function() {
        document.getElementById('code-editor-textarea').value = '';
        document.getElementById('code-char-count').textContent = '0 chars';
        document.getElementById('execution-output-area').style.display = 'none';
        document.getElementById('execution-error-area').style.display = 'none';
    },

    // Load example code
    loadExample: function() {
        const examples = {
            python: `# Example: Calculate Fibonacci sequence
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Print first 10 Fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
            javascript: `// Example: Calculate Fibonacci sequence
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

// Print first 10 Fibonacci numbers
for (let i = 0; i < 10; i++) {
    console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`
        };

        const textarea = document.getElementById('code-editor-textarea');
        textarea.value = examples[this.currentLanguage] || examples.python;
        document.getElementById('code-char-count').textContent = textarea.value.length + ' chars';
    },

    // Close modal
    closeModal: function() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
    },

    // Get user executions history
    getUserExecutions: async function(limit = 20, offset = 0) {
        try {
            const token = getToken();
            if (!token) return [];

            const response = await fetch(`${API_URL}/chat/execute?limit=${limit}&offset=${offset}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return data.executions || [];
        } catch (error) {
            console.error('[CODE_EXEC] Get executions error:', error);
            return [];
        }
    }
};

// Global functions
window.CodeExecution = CodeExecution;

// Add to ChatEnhanced if available
if (window.ChatEnhanced) {
    ChatEnhanced.showCodeExecutionModal = function(code = '', language = 'python') {
        CodeExecution.showExecutionModal(code, language);
    };
}
