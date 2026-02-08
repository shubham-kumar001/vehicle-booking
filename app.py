from flask import Flask, render_template, request, redirect, url_for, flash, send_file, jsonify
from werkzeug.utils import secure_filename
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-for-bca-project'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 
    'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'mp3', 'mp4', 'zip', 'rar'
}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Create uploads folder if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # Check if file was uploaded
        if 'file' not in request.files:
            flash('No file selected!')
            return redirect(request.url)
        
        file = request.files['file']
        
        # Check if file was selected
        if file.filename == '':
            flash('No file selected!')
            return redirect(request.url)
        
        # Check if file is allowed
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            
            # Add timestamp to filename to avoid conflicts
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{filename}"
            
            # Save file
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            flash(f'✅ File uploaded successfully: {filename}')
            return redirect(url_for('list_files'))
        else:
            flash('❌ File type not allowed!')
    
    return render_template('upload.html')

@app.route('/files')
def list_files():
    files = []
    
    # Get all files from uploads folder
    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        if os.path.isfile(filepath):
            # Get file stats
            stat = os.stat(filepath)
            size = stat.st_size
            created = datetime.fromtimestamp(stat.st_ctime)
            
            # Remove timestamp from display name
            display_name = '_'.join(filename.split('_')[2:]) if '_' in filename else filename
            
            files.append({
                'filename': filename,
                'display_name': display_name,
                'size': size,
                'created': created.strftime('%Y-%m-%d %H:%M'),
                'url': url_for('download_file', filename=filename)
            })
    
    # Sort by creation date (newest first)
    files.sort(key=lambda x: x['created'], reverse=True)
    
    return render_template('files.html', files=files)

@app.route('/download/<filename>')
def download_file(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if os.path.exists(file_path):
        # Get original filename without timestamp
        display_name = '_'.join(filename.split('_')[2:]) if '_' in filename else filename
        return send_file(file_path, as_attachment=True, download_name=display_name)
    else:
        flash('File not found!')
        return redirect(url_for('list_files'))

@app.route('/delete/<filename>')
def delete_file(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if os.path.exists(file_path):
        os.remove(file_path)
        flash('🗑️ File deleted successfully!')
    else:
        flash('File not found!')
    
    return redirect(url_for('list_files'))

@app.route('/api/files')
def api_files():
    files = []
    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.isfile(filepath):
            stat = os.stat(filepath)
            files.append({
                'name': filename,
                'size': stat.st_size,
                'created': datetime.fromtimestamp(stat.st_ctime).strftime('%Y-%m-%d %H:%M')
            })
    return jsonify(files)

if __name__ == '__main__':
    print("🚀 Starting Cloud File Storage System...")
    print("📁 Upload folder:", app.config['UPLOAD_FOLDER'])
    print("🌐 Open your browser and go to: http://localhost:5000")
    app.run(debug=True, port=5000)
