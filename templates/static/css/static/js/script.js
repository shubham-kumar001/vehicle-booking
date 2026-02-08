// When page loads
document.addEventListener('DOMContentLoaded', function() {
    // Setup drag and drop
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    
    if (dropArea && fileInput && fileInfo) {
        // Prevent default behaviors
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
            dropArea.style.borderColor = '#667eea';
            dropArea.style.backgroundColor = '#f0f2ff';
        }
        
        function unhighlight() {
            dropArea.classList.remove('dragover');
            dropArea.style.borderColor = '#ddd';
            dropArea.style.backgroundColor = '';
        }
        
        // Handle drop
        dropArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFileInfo(files[0]);
            }
        }
        
        // Handle file selection
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                updateFileInfo(this.files[0]);
            }
        });
        
        function updateFileInfo(file) {
            const fileSize = file.size > 1024 * 1024 
                ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
                : (file.size / 1024).toFixed(2) + ' KB';
            
            fileInfo.innerHTML = `
                <strong>Selected File:</strong> ${file.name}<br>
                <strong>Size:</strong> ${fileSize}<br>
                <strong>Type:</strong> ${file.type || 'Unknown'}
            `;
            fileInfo.style.color = '#28a745';
        }
        
        // Add click event to drop area
        dropArea.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // Upload form validation
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            const fileInput = document.getElementById('fileInput');
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const maxSize = 10 * 1024 * 1024; // 10MB
                
                if (file.size > maxSize) {
                    e.preventDefault();
                    alert('❌ File is too large! Maximum size is 10MB.');
                    return false;
                }
                
                // Show loading
                const submitBtn = uploadForm.querySelector('.btn-upload');
                if (submitBtn) {
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
                    submitBtn.disabled = true;
                    
                    // Restore button after 5 seconds (in case upload fails)
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }, 5000);
                }
            }
        });
    }
    
    // Auto-hide flash messages after 5 seconds
    const flashMessages = document.querySelectorAll('.flash');
    flashMessages.forEach(flash => {
        setTimeout(() => {
            flash.style.opacity = '0';
            flash.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                flash.remove();
            }, 500);
        }, 5000);
    });
});

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
