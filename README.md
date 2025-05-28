# PDF to Markdown Converter 📄➡️📝

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

This project is dual-licensed. See the [License](#license) section for details.

A modern, user-friendly web application that converts PDF documents to clean, formatted Markdown text. Built with React frontend and Python Flask backend, featuring real-time conversion progress tracking and a sleek interface.

## ✨ Features

- **Drag & Drop Interface**: Simply drag your PDF files into the application
- **Real-time Progress Tracking**: Watch your conversion progress with detailed status updates
- **Clean Markdown Output**: Get well-formatted Markdown that preserves document structure
- **File Information Display**: See file size, page count, and conversion timestamp
- **Modern UI**: Beautiful, responsive interface that works on all devices
- **Fast Processing**: Efficient conversion using PyMuPDF4LLM library

## 🚀 Quick Start with Docker (Recommended)

The easiest way to get started is using Docker Compose. This will set up both the frontend and backend automatically.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (usually comes with Docker Desktop)

### Production Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/murtaza-nasir/pdf3md.git
   cd pdf3md
   ```

2. **Start the application**:
   ```bash
   docker compose up -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:6201

4. **Stop the application**:
   ```bash
   docker compose down
   ```

### Development Setup

For development with hot-reloading and live code changes:

1. **Start in development mode**:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Access the application**:
   - Frontend (with hot-reload): http://localhost:5173
   - Backend API: http://localhost:6201

3. **Stop development environment**:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## 🛠️ Manual Setup (Alternative)

If you prefer to run the application without Docker, you can set it up manually.

### Prerequisites

- Python 3.8+ with pip
- Node.js 16+ with npm
- (Optional) Conda environment

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd pdf3md
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server**:
   ```bash
   python app.py
   ```
   
   The backend will be available at http://localhost:6201

### Frontend Setup

1. **In a new terminal, navigate to the frontend directory**:
   ```bash
   cd pdf3md
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at http://localhost:5173

### Using the Convenience Scripts

The project includes handy scripts for starting and stopping both services:

- **Start both frontend and backend**:
  ```bash
  cd pdf3md
  ./start_server.sh
  ```

- **Stop both services**:
  ```bash
  cd pdf3md
  ./stop_server.sh
  ```

## 📖 How to Use

1. **Open the application** in your web browser
2. **Upload a PDF** by either:
   - Dragging and dropping a PDF file onto the upload area
   - Clicking the upload area and selecting a file
3. **Watch the progress** as your PDF is converted
4. **Copy the result** - the Markdown text will appear in the output area
5. **Download or copy** the converted Markdown for use in your projects

## 🏗️ Project Structure

```
pdf3md/
├── src/                    # React frontend source code
│   ├── components/         # React components
│   ├── App.jsx            # Main application component
│   └── main.jsx           # Application entry point
├── public/                # Static assets
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
├── Dockerfile.backend     # Backend Docker configuration
├── Dockerfile.frontend    # Frontend Docker configuration
├── start_server.sh        # Convenience script to start services
├── stop_server.sh         # Convenience script to stop services
└── vite.config.js         # Vite build configuration

docker-compose.yml         # Production Docker Compose
docker-compose.dev.yml     # Development Docker Compose
README.md                  # This file
```

## 🔧 Configuration

### Backend Configuration

The Flask backend runs on port 6201 by default. You can modify this in `app.py`:

```python
app.run(host='0.0.0.0', port=6201)
```

### Frontend Configuration

The React frontend is configured to proxy API requests to the backend. If you change the backend port, update the proxy configuration in `vite.config.js`.

### Environment Variables

For Docker deployments, you can customize the following environment variables:

- `FLASK_ENV`: Set to `development` or `production`
- `FLASK_DEBUG`: Set to `1` for debug mode
- `PYTHONUNBUFFERED`: Set to `1` for immediate output

## 🐳 Docker Commands Reference

### Production Commands
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose up -d --build

# Remove everything (containers, networks, volumes)
docker-compose down -v --remove-orphans
```

### Development Commands
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

## 🔍 Troubleshooting

### Common Issues

**Port already in use**:
- Make sure no other services are running on ports 3000, 5173, or 6201
- Use `docker-compose down` to stop any running containers

**Permission denied on scripts**:
```bash
chmod +x pdf3md/start_server.sh
chmod +x pdf3md/stop_server.sh
```

**Docker build fails**:
- Make sure Docker is running
- Try rebuilding with: `docker-compose up --build`

**Frontend can't connect to backend**:
- Verify the backend is running on port 6201
- Check that CORS is properly configured in the Flask app

### Logs and Debugging

**View Docker logs**:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Manual setup logs**:
- Backend logs: Check `pdf3md/backend.log`
- Frontend logs: Check `pdf3md/frontend.log`

## 🙏 Acknowledgments

- Built with [PyMuPDF4LLM](https://github.com/pymupdf/PyMuPDF4LLM) for PDF processing
- Frontend powered by [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Backend built with [Flask](https://flask.palletsprojects.com/)

## License

This project is **dual-licensed**:

1.  **GNU Affero General Public License v3.0 (AGPLv3)**
    [![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

    Speakr is offered under the AGPLv3 as its open-source license. You are free to use, modify, and distribute this software under the terms of the AGPLv3. A key condition of the AGPLv3 is that if you run a modified version on a network server and provide access to it for others, you must also make the source code of your modified version available to those users under the AGPLv3.

    * You **must** create a file named `LICENSE` (or `COPYING`) in the root of your repository and paste the full text of the [GNU AGPLv3 license](https://www.gnu.org/licenses/agpl-3.0.txt) into it.
    * Read the full license text carefully to understand your rights and obligations.

2.  **Commercial License**

    For users or organizations who cannot or do not wish to comply with the terms of the AGPLv3 (for example, if you want to integrate Speakr into a proprietary commercial product or service without being obligated to share your modifications under AGPLv3), a separate commercial license is available.

    Please contact **[Your Name/Company Name and Email Address or Website Link for Licensing Inquiries]** for details on obtaining a commercial license.

**You must choose one of these licenses** under which to use, modify, or distribute this software. If you are using or distributing the software without a commercial license agreement, you must adhere to the terms of the AGPLv3.

## Contributing

While direct code contributions are not the primary focus at this stage, feedback, bug reports, and feature suggestions are highly valuable! Please feel free to open an Issue on the GitHub repository.

**Note on Future Contributions and CLAs:**
Should this project begin accepting code contributions from external developers in the future, signing a **Contributor License Agreement (CLA)** will be **required** before any pull requests can be merged. This policy ensures that the project maintainer receives the necessary rights to distribute all contributions under both the AGPLv3 and the commercial license options offered. Details on the CLA process will be provided if and when the project formally opens up to external code contributions.

---

**Happy converting!** If you find this tool useful, please consider giving it a star ⭐