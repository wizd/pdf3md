# app.py
from flask import Flask, request
from flask_cors import CORS
import pymupdf4llm
import os

app = Flask(__name__)
CORS(app)

@app.route('/convert', methods=['POST'])
def convert():
    if 'pdf' not in request.files:
        return 'No file uploaded', 400
        
    file = request.files['pdf']
    if file.filename == '':
        return 'No file selected', 400

    # Save uploaded file temporarily
    temp_path = 'temp.pdf'
    file.save(temp_path)
    
    try:
        # Convert PDF to markdown
        markdown = pymupdf4llm.to_markdown(temp_path)
        return markdown
    finally:
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True, port=5001)