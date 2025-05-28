# PDF to Markdown and Word Converter

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

This project is dual-licensed. Please see the [License](#license) section for comprehensive details.

PDF3MD is a web application designed for efficient conversion of PDF documents into well-structured Markdown and Microsoft Word (DOCX) formats. It features a React-based frontend and a Python Flask backend, providing a seamless user experience with real-time progress updates.

## Core Features

-   **PDF to Markdown Conversion**: Transforms PDF documents into clean, readable Markdown, preserving structural elements.
-   **Markdown to Word (DOCX) Conversion**: Converts user-provided Markdown text to DOCX format using Pandoc for high-fidelity output.
-   **Multi-File Upload**: Supports uploading and processing multiple PDF files simultaneously for PDF to Markdown conversion.
-   **Drag & Drop Interface**: User-friendly file uploads via drag and drop or traditional file selection.
-   **Real-time Progress Tracking**: Detailed status updates during the conversion process for each file.
-   **File Information Display**: Shows original filename, file size, page count, and conversion timestamp.
-   **Modern and Responsive UI**: Intuitive interface designed for ease of use across various devices.

## Technology Stack

-   **Frontend**: React, Vite
-   **Backend**: Python, Flask
-   **PDF Processing**: PyMuPDF4LLM
-   **Markdown to DOCX Conversion**: Pandoc

## Getting Started

The easiest and recommended way to run PDF3MD is using the provided Docker quick start script.

### Prerequisites

-   Docker Engine
-   Docker Compose (typically included with Docker Desktop)
-   Git (for cloning the repository)

### Using the Quick Start Script (Recommended for Docker)

This script simplifies managing the Docker containers for both production and development environments.

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/murtaza-nasir/pdf3md.git
    cd pdf3md
    ```

2.  **Start in Production Mode**:
    ```bash
    ./docker-start.sh start
    ```
    -   Access Frontend: `http://localhost:3000`
    -   Access Backend API: `http://localhost:6201`

3.  **Start in Development Mode** (with hot-reloading):
    ```bash
    ./docker-start.sh dev
    ```
    -   Access Frontend (Vite Dev Server): `http://localhost:5173`
    -   Access Backend API: `http://localhost:6201`

4.  **Other Useful Script Commands**:
    ```bash
    ./docker-start.sh stop      # Stop all services
    ./docker-start.sh status    # Check running services
    ./docker-start.sh logs      # View logs from services
    ./docker-start.sh help      # Display all available script commands
    ```
    Ensure the script is executable: `chmod +x ./docker-start.sh`

### Direct Docker Compose Usage (Alternative)

If you prefer to use Docker Compose commands directly:

#### Production Deployment

1.  **Clone the Repository** (if not already done):
    ```bash
    git clone https://github.com/murtaza-nasir/pdf3md.git
    cd pdf3md
    ```
2.  **Start Services**:
    ```bash
    docker compose up -d
    ```
3.  **Access Application**: Frontend at `http://localhost:3000`, Backend API at `http://localhost:6201`.
4.  **Stop Services**:
    ```bash
    docker compose down
    ```

#### Development Environment

1.  **Start Services**:
    ```bash
    docker-compose -f docker-compose.dev.yml up
    ```
2.  **Access Application**: Frontend (Vite) at `http://localhost:5173`, Backend API at `http://localhost:6201`.
3.  **Stop Services**:
    ```bash
    docker-compose -f docker-compose.dev.yml down
    ```

### Manual Setup

Alternatively, you can run the application components manually.

#### Backend (Flask)

1.  Navigate to the `pdf3md` sub-directory: `cd pdf3md`
2.  Install Python dependencies: `pip install -r requirements.txt`
3.  Start the backend server: `python app.py`
    (The backend will be available at `http://localhost:6201`)

#### Frontend (React)

1.  In a new terminal, navigate to the `pdf3md` sub-directory: `cd pdf3md`
2.  Install Node.js dependencies: `npm install`
3.  Start the frontend development server: `npm run dev`
    (The frontend will be available at `http://localhost:5173`)

#### Convenience Scripts

The `pdf3md` sub-directory contains scripts for managing both services:
-   `./start_server.sh`: Starts both frontend and backend.
-   `./stop_server.sh`: Stops both services.
    (Ensure these scripts are executable: `chmod +x ./start_server.sh ./stop_server.sh`)

## Usage Instructions

1.  Open the PDF3MD application in your web browser.
2.  Upload one or more PDF files using the drag-and-drop area or by clicking to select files.
3.  Monitor the real-time progress as each PDF is converted.
4.  Once a file is processed, the resulting Markdown will be displayed.
5.  You can then:
    -   Copy the Markdown text (from PDF to MD conversion).
    -   In "MD → Word" mode, input Markdown and download the content as a DOCX file (powered by Pandoc).

## Configuration Notes

-   **Backend Port**: The Flask server runs on port `6201` by default, configurable in `pdf3md/app.py`.
-   **Frontend API Proxy**: The Vite development server proxies API requests. If the backend port changes, update `pdf3md/vite.config.js`.
-   **Environment Variables (Docker)**:
    -   `FLASK_ENV`: `development` or `production`.
    -   `FLASK_DEBUG`: `1` for debug mode.

## Troubleshooting

-   **Port Conflicts**: Ensure ports `3000`, `5173` (for dev), and `6201` are not in use by other applications. Use `docker compose down` to stop existing PDF3MD containers.
-   **Script Permissions (Manual Setup)**: If `start_server.sh` or `stop_server.sh` fail, make them executable: `chmod +x pdf3md/start_server.sh pdf3md/stop_server.sh`.
-   **Docker Issues**: Ensure Docker is running. Try rebuilding images with `docker compose up --build`.
-   **API Connectivity**: Verify the backend is running and accessible. Check browser console for errors.

## License

This project is **dual-licensed**:

1.  **GNU Affero General Public License v3.0 (AGPLv3)**
    [![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

    PDF3MD is offered under the AGPLv3 as its open-source license. You are free to use, modify, and distribute this software under the terms of the AGPLv3. A key condition of the AGPLv3 is that if you run a modified version on a network server and provide access to it for others, you must also make the source code of your modified version available to those users under the AGPLv3.

    You **must** create a file named `LICENSE` (or `COPYING`) in the root of your repository and paste the full text of the [GNU AGPLv3 license](https://www.gnu.org/licenses/agpl-3.0.txt) into it. Read the full license text carefully to understand your rights and obligations.

2.  **Commercial License**

    For users or organizations who cannot or do not wish to comply with the terms of the AGPLv3 (for example, if you want to integrate PDF3MD into a proprietary commercial product or service without being obligated to share your modifications under AGPLv3), a separate commercial license is available.

    Please contact **[Your Name/Company Name and Email Address or Website Link for Licensing Inquiries]** for details on obtaining a commercial license.

**You must choose one of these licenses** under which to use, modify, or distribute this software. If you are using or distributing the software without a commercial license agreement, you must adhere to the terms of the AGPLv3.

## Acknowledgments

-   PDF processing powered by [PyMuPDF4LLM](https://pypi.org/project/pymupdf4llm/).
-   Markdown to DOCX conversion via [Pandoc](https://pandoc.org/).
-   Frontend developed with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/).
-   Backend implemented using [Flask](https://flask.palletsprojects.com/).

## Contributing

Feedback, bug reports, and feature suggestions are highly appreciated. Please open an Issue on the GitHub repository.

**Note on Future Contributions and CLAs:**
Should this project begin accepting code contributions from external developers in the future, signing a Contributor License Agreement (CLA) will be required before any pull requests can be merged. This policy ensures that the project maintainer receives the necessary rights to distribute all contributions under both the AGPLv3 and the commercial license options offered. Details on the CLA process will be provided if and when the project formally opens up to external code contributions.
