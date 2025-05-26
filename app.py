# app.py
from flask import Flask, request
from flask_cors import CORS
import pymupdf4llm
import os
import logging
import traceback

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/convert', methods=['POST'])
def convert():
    try:
        if 'pdf' not in request.files:
            logger.error('No file in request')
            return 'No file uploaded', 400
            
        file = request.files['pdf']
        if file.filename == '':
            logger.error('Empty filename')
            return 'No file selected', 400

        # Save uploaded file temporarily
        temp_path = os.path.abspath('temp.pdf')
        logger.info(f'Saving file to {temp_path}')
        file.save(temp_path)
        
        try:
            # Convert PDF to markdown
            logger.info('Starting PDF conversion')
            markdown = pymupdf4llm.to_markdown(temp_path)
            logger.info('Conversion successful')
            return markdown
        except Exception as e:
            logger.error(f'Conversion error: {str(e)}')
            logger.error(traceback.format_exc())
            return f'Error converting PDF: {str(e)}', 500
        finally:
            # Cleanup temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                logger.info('Temp file removed')

    except Exception as e:
        logger.error(f'Server error: {str(e)}')
        logger.error(traceback.format_exc())
        return f'Server error: {str(e)}', 500

if __name__ == '__main__':
    logger.info('Starting Flask server...')
    app.run(host='0.0.0.0', port=6201)