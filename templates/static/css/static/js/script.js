/**
 * CLOUD FILE UPLOAD STORAGE APPS
 * Main JavaScript File
 * BCA Final Year Project
 */

// ============================================
// GLOBAL VARIABLES
// ============================================
const CONFIG = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'],
    uploadUrl: '/upload',
    apiUrl: '/api/files',
    refreshInterval: 30000 // 30 seconds
};

// ============================================
// DOM ELEMENTS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Cloud File Storage App Initialized');
    
    // Initialize all components
    initDragAndDrop();
    initFileInput();
    initFlashMessages();
    initFilePreview();
    initSearchFilter();
    initStatsUpdate();
    initThemeToggle();
    
    // Update stats every 30 seconds
    setInterval(updateStats, CONFIG.refreshInterval);
});

// ============================================
// DRAG AND DROP UPLOAD
// ============================================
function initDragAndDrop() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!dropArea || !fileInput) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop area
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('dragover');
    }
    
    function unhighlight() {
        dropArea.classList.remove('dragover');
    }
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }
    
    // Handle click on drop area
    dropArea.addEventListener('click', () => {
        fileInput.click();
    });
}

// ============================================
// FILE INPUT HANDLER
// ============================================
function initFileInput() {
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                handleFileSelect(this.files[0]);
            }
        });
    }
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }
}

function handleFileSelect(file) {
    const fileInfo = document.getElementById('fileInfo');
    const uploadBtn = document.querySelector('.btn-upload');
    
    if (!fileInfo) return;
    
    // Validate file
    const validation = validateFile(file);
    
    if (!validation.valid) {
        showNotification(validation.message, 'error');
        if (uploadBtn) uploadBtn.disabled = true;
        return;
    }
    
    // Display file info
    fileInfo.innerHTML = `
        <p><i class="fas fa-check-circle" style="color: var(--success);"></i> <strong>File selected:</strong> ${file.name}</p>
        <p><i class="fas fa-weight"></i> <strong>Size:</strong> ${formatFileSize(file.size)}</p>
        <p><i class="fas fa-file"></i> <strong>Type:</strong> ${file.type || 'Unknown'}</p>
    `;
    
    if (uploadBtn) uploadBtn.disabled = false;
    
    // Show preview if image
    if (file.type.startsWith('image/')) {
        previewImage(file);
    }
}

function validateFile(file) {
    // Check file size
    if (file.size > CONFIG.maxFileSize) {
        return {
            valid: false,
            message: `File too large! Maximum size is ${formatFileSize(CONFIG.maxFileSize)}`
        };
    }
    
    // Check file extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!CONFIG.allowedTypes.includes(ext)) {
        return {
            valid: false,
            message: 'File type not allowed!'
        };
    }
    
    return { valid: true };
}

function previewImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        
        const fileInfo = document.getElementById('fileInfo');
        if (fileInfo) {
            fileInfo.appendChild(preview);
        }
    };
    reader.readAsDataURL(file);
}

// ============================================
// UPLOAD HANDLER
// ============================================
async function handleUpload(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const file = formData.get('file');
    
    if (!file || file.size === 0) {
        showNotification('Please select a file!', 'error');
        return;
    }
    
    // Show progress bar
    const progressBar = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressBar) progressBar.style.display = 'block';
    
    try {
        // Simulate progress (since Flask doesn't support progress natively)
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progressFill) progressFill.style.width = progress + '%';
            if (progressText) progressText.textContent = `Uploading... ${progress}%`;
            
            if (progress >= 90) clearInterval(interval);
        }, 200);
        
        // Submit form
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });
        
        clearInterval(interval);
        
        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.textContent = 'Upload complete!';
        
        if (response.ok) {
            showNotification('File uploaded successfully!', 'success');
            setTimeout(() => {
                window.location.href = '/files';
            }, 1500);
        } else {
            showNotification('Upload failed!', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Upload failed! Check console for details.', 'error');
    }
}

// ============================================
// FLASH MESSAGES
// ============================================
function initFlashMessages() {
    const flashes = document.querySelectorAll('.flash');
    
    flashes.forEach(flash => {
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            flash.style.opacity = '0';
            flash.style.transform = 'translateX(100%)';
            setTimeout(() => {
                flash.remove();
            }, 500);
        }, 5000);
        
        // Click to dismiss
        flash.addEventListener('click', () => {
            flash.style.opacity = '0';
            flash.style.transform = 'translateX(100%)';
            setTimeout(() => {
                flash.remove();
            }, 500);
        });
    });
}

function showNotification(message, type = 'info') {
    const container = document.querySelector('.flash-messages');
    if (!container) return;
    
    const flash = document.createElement('div');
    flash.className = `flash ${type}`;
    flash.innerHTML = `
        <i class="fas fa-${getIconForType(type)}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(flash);
    
    // Auto remove
    setTimeout(() => {
        flash.style.opacity = '0';
        flash.style.transform = 'translateX(100%)';
        setTimeout(() => {
            flash.remove();
        }, 500);
    }, 5000);
}

function getIconForType(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ============================================
// FILE PREVIEW
// ============================================
function initFilePreview() {
    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const fileUrl = this.dataset.url;
            const fileName = this.dataset.name;
            
            try {
                const response = await fetch(fileUrl);
                const blob = await response.blob();
                
                // Create object URL
                const url = window.URL.createObjectURL(blob);
                
                // Open in new window
                window.open(url, '_blank');
            } catch (error) {
                console.error('Preview error:', error);
                showNotification('Could not preview file', 'error');
            }
        });
    });
}

// ============================================
// SEARCH AND FILTER
// ============================================
function initSearchFilter() {
    const searchInput = document.getElementById('searchFiles');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const fileName = row.querySelector('.file-name').textContent.toLowerCase();
            if (fileName.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
        
        // Show/hide no results message
        const visibleRows = document.querySelectorAll('tbody tr:not([style*="display: none"])');
        const noResults = document.getElementById('noResults');
        
        if (noResults) {
            if (visibleRows.length === 0) {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        }
    });
}

// ============================================
// STATISTICS UPDATE
// ============================================
async function updateStats() {
    try {
        const response = await fetch('/stats');
        const stats = await response.json();
        
        // Update total files
        const fileCount = document.getElementById('fileCount');
        if (fileCount) {
            fileCount.textContent = stats.total_files;
        }
        
        // Update total size
        const totalSize = document.getElementById('totalSize');
        if (totalSize) {
            totalSize.textContent = stats.total_size_formatted;
        }
        
    } catch (error) {
        console.error('Stats update error:', error);
    }
}

function initStatsUpdate() {
    updateStats();
}

// ============================================
// THEME TOGGLE
// ============================================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        const icon = this.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function confirmDelete(filename) {
    return confirm(`Are you sure you want to delete "${filename}"?`);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy!', 'error');
    });
}

// ============================================
// ERROR HANDLING
// ============================================
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global error:', { msg, url, lineNo, columnNo, error });
    showNotification('An error occurred. Check console.', 'error');
    return false;
};

// ============================================
// EXPORT FUNCTIONS (for debugging)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatFileSize,
        validateFile,
        showNotification
    };
}
