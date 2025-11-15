// Syntax Highlighting for AI Chat - Kintsugi AI
// Lightweight syntax highlighter without external dependencies

const SyntaxHighlighter = {
    // Language keywords
    keywords: {
        javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'class', 'extends', 'import', 'export', 'default', 'new', 'this', 'super', 'static', 'typeof', 'instanceof'],
        python: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'in', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'lambda', 'yield', 'async', 'await', 'True', 'False', 'None', 'and', 'or', 'not'],
        java: ['public', 'private', 'protected', 'static', 'final', 'class', 'interface', 'extends', 'implements', 'new', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'throws', 'void', 'int', 'String', 'boolean', 'double', 'float', 'long'],
        go: ['func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface', 'if', 'else', 'for', 'range', 'return', 'defer', 'go', 'chan', 'select', 'case', 'default', 'switch', 'break', 'continue', 'fallthrough', 'goto'],
        rust: ['fn', 'let', 'mut', 'const', 'static', 'struct', 'enum', 'impl', 'trait', 'use', 'mod', 'pub', 'if', 'else', 'match', 'loop', 'while', 'for', 'in', 'return', 'break', 'continue', 'async', 'await', 'move'],
        typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'class', 'extends', 'implements', 'interface', 'type', 'enum', 'public', 'private', 'protected', 'readonly'],
        html: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'script', 'style', 'link', 'meta'],
        css: ['color', 'background', 'border', 'margin', 'padding', 'width', 'height', 'display', 'flex', 'grid', 'position', 'font', 'text', 'transform', 'transition', 'animation']
    },

    // Detect language from code
    detectLanguage: function(code) {
        const lower = code.toLowerCase();

        if (lower.includes('function') || lower.includes('const ') || lower.includes('let ') || lower.includes('=>')) {
            if (lower.includes('interface') || lower.includes('type ')) return 'typescript';
            return 'javascript';
        }
        if (lower.includes('def ') || lower.includes('import ') && lower.includes('from ')) return 'python';
        if (lower.includes('public class') || lower.includes('private ') || lower.includes('System.out')) return 'java';
        if (lower.includes('func ') || lower.includes('package ')) return 'go';
        if (lower.includes('fn ') || lower.includes('impl ') || lower.includes('trait ')) return 'rust';
        if (lower.includes('<!doctype') || lower.includes('<html') || lower.includes('<div')) return 'html';
        if (lower.includes('{') && (lower.includes('color:') || lower.includes('display:'))) return 'css';
        if (lower.includes('select ') || lower.includes('from ') && lower.includes('where ')) return 'sql';

        return 'code';
    },

    // Escape HTML
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Highlight code
    highlight: function(code, language) {
        code = this.escapeHtml(code);
        const lang = language || this.detectLanguage(code);
        const keywords = this.keywords[lang] || [];

        // Highlight strings
        code = code.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="hl-string">$&</span>');

        // Highlight comments
        code = code.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, '<span class="hl-comment">$&</span>');

        // Highlight numbers
        code = code.replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>');

        // Highlight keywords
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            code = code.replace(regex, '<span class="hl-keyword">$1</span>');
        });

        // Highlight functions
        code = code.replace(/\b(\w+)\s*\(/g, '<span class="hl-function">$1</span>(');

        return code;
    },

    // Format markdown code blocks
    formatCodeBlocks: function(markdown) {
        return markdown.replace(/```(\w+)?\n([\s\S]+?)```/g, (match, lang, code) => {
            const language = lang || this.detectLanguage(code);
            const highlighted = this.highlight(code.trim(), language);
            const codeId = 'code-' + Math.random().toString(36).substr(2, 9);

            return `
                <div class="code-block-enhanced" data-code-id="${codeId}">
                    <div class="code-header">
                        <span class="code-language">${language.toUpperCase()}</span>
                        <div class="code-actions">
                            <button onclick="copyCodeEnhanced('${codeId}')" class="code-btn interactive" title="Copy code">
                                📋 COPY
                            </button>
                            <button onclick="downloadCodeEnhanced('${codeId}', '${language}')" class="code-btn interactive" title="Download">
                                ⬇ SAVE
                            </button>
                            <button onclick="executeCode('${codeId}', '${language}')" class="code-btn interactive" title="Run code">
                                ▶ RUN
                            </button>
                        </div>
                    </div>
                    <pre class="code-content"><code class="language-${language}">${highlighted}</code></pre>
                    <div class="code-output" id="output-${codeId}" style="display: none;">
                        <div class="code-output-header">OUTPUT:</div>
                        <pre class="code-output-content"></pre>
                    </div>
                </div>
            `;
        });
    },

    // Format inline code
    formatInlineCode: function(text) {
        return text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    },

    // Format markdown
    formatMarkdown: function(text) {
        // Code blocks first
        text = this.formatCodeBlocks(text);

        // Bold
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-gold">$1</strong>');

        // Italic
        text = text.replace(/\*(.+?)\*/g, '<em class="text-cyan">$1</em>');

        // Inline code
        text = this.formatInlineCode(text);

        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan" target="_blank" rel="noopener">$1 ↗</a>');

        // Headings
        text = text.replace(/^### (.+)$/gm, '<h3 class="text-gold" style="font-size: 1.25rem; margin: 1rem 0 0.5rem 0;">$1</h3>');
        text = text.replace(/^## (.+)$/gm, '<h2 class="text-cyan" style="font-size: 1.5rem; margin: 1.5rem 0 0.75rem 0;">$1</h2>');
        text = text.replace(/^# (.+)$/gm, '<h1 class="text-gold" style="font-size: 2rem; margin: 2rem 0 1rem 0;">$1</h1>');

        // Lists
        text = text.replace(/^- (.+)$/gm, '<li style="margin-left: 1.5rem; color: var(--cyber-cyan);">▸ $1</li>');
        text = text.replace(/^\d+\. (.+)$/gm, '<li style="margin-left: 1.5rem; color: var(--kintsugi-gold);">$1</li>');

        // Line breaks
        text = text.replace(/\n\n/g, '<br><br>');

        return text;
    }
};

// Global helper functions
window.copyCodeEnhanced = function(codeId) {
    const codeBlock = document.querySelector(`[data-code-id="${codeId}"]`);
    const code = codeBlock.querySelector('code').textContent;

    navigator.clipboard.writeText(code).then(() => {
        const btn = codeBlock.querySelector('.code-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ COPIED!';
        btn.style.background = 'var(--matrix-green)';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    });
};

window.downloadCodeEnhanced = function(codeId, lang) {
    const codeBlock = document.querySelector(`[data-code-id="${codeId}"]`);
    const code = codeBlock.querySelector('code').textContent;

    const extensions = {
        'javascript': 'js',
        'typescript': 'ts',
        'python': 'py',
        'java': 'java',
        'go': 'go',
        'rust': 'rs',
        'html': 'html',
        'css': 'css',
        'sql': 'sql'
    };

    const ext = extensions[lang] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kintsugi-code-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.executeCode = function(codeId, lang) {
    const codeBlock = document.querySelector(`[data-code-id="${codeId}"]`);
    const code = codeBlock.querySelector('code').textContent;
    const output = document.getElementById(`output-${codeId}`);
    const outputContent = output.querySelector('.code-output-content');

    output.style.display = 'block';
    outputContent.textContent = '';

    if (lang === 'javascript') {
        try {
            // Capture console.log
            const logs = [];
            const originalLog = console.log;
            console.log = function(...args) {
                logs.push(args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' '));
                originalLog.apply(console, args);
            };

            // Execute code
            const result = eval(code);

            // Restore console.log
            console.log = originalLog;

            // Show output
            if (logs.length > 0) {
                outputContent.textContent = logs.join('\n');
            } else if (result !== undefined) {
                outputContent.textContent = String(result);
            } else {
                outputContent.textContent = '✓ Code executed successfully (no output)';
            }
        } catch (error) {
            outputContent.textContent = `❌ Error: ${error.message}`;
            outputContent.style.color = 'var(--neon-pink)';
        }
    } else {
        outputContent.textContent = `⚠ Code execution is only available for JavaScript.\n\nOther languages require server-side execution.`;
        outputContent.style.color = 'var(--kintsugi-gold)';
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyntaxHighlighter;
}
