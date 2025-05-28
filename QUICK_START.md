# Quick Start Guide

Get PDF3MD running in under 2 minutes!

## Option 1: Using Pre-built Docker Images (Recommended)

**Prerequisites**: Docker installed on your system.

1.  **Prepare Required Files**:
    *   Create a directory for your application (e.g., `mkdir pdf3md-app && cd pdf3md-app`).
    *   **`docker-compose.yml`**: Create a file named `docker-compose.yml` in this directory and paste the following content into it:
        ```yaml
        services:
          backend:
            image: docker.io/learnedmachine/pdf3md-backend:latest 
            container_name: pdf3md-backend
            ports:
              - "6201:6201"
            environment:
              - PYTHONUNBUFFERED=1
              - FLASK_ENV=production
            volumes:
              - ./pdf3md/temp:/app/temp # Creates a local temp folder
            restart: unless-stopped
            healthcheck:
              test: ["CMD", "curl", "-f", "http://localhost:6201/"]
              interval: 30s
              timeout: 10s
              retries: 3
              start_period: 40s

          frontend:
            image: docker.io/learnedmachine/pdf3md-frontend:latest 
            container_name: pdf3md-frontend
            ports:
              - "3000:3000"
            depends_on:
              - backend
            restart: unless-stopped
            healthcheck:
              test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
              interval: 30s
              timeout: 10s
              retries: 3
              start_period: 40s

        networks:
          default:
            name: pdf3md-network
        ```
    *   **`docker-start.sh`**: Download the `docker-start.sh` script from the [pdf3md GitHub repository's main branch](https://github.com/murtaza-nasir/pdf3md/blob/main/docker-start.sh) and place it in the same directory.
    *   Make the script executable: `chmod +x ./docker-start.sh`

2.  **Start the Application**:
    In the directory where you placed `docker-compose.yml` and `docker-start.sh`, run:
    ```bash
    ./docker-start.sh start
    ```
    This will pull the latest images from Docker Hub and start the application.

# 3. Open in browser
# Frontend: http://localhost:3000
# Backend: http://localhost:6201
```

**That's it!**

### Development Mode (Using Local Source Code)
This mode is for making code changes and requires cloning the full repository.
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/murtaza-nasir/pdf3md.git
    cd pdf3md
    ```
    The `docker-compose.dev.yml` file will be included in the clone.
2.  **Start in Development Mode**:
    ```bash
    ./docker-start.sh dev
    ```
    This typically uses `docker-compose.dev.yml` to build images locally and mount your source code for hot-reloading.
    ```
    # Frontend with hot-reload: http://localhost:5173
    ```

### Useful Commands (with `docker-start.sh`)
```bash
./docker-start.sh status    # Check what's running
./docker-start.sh stop      # Stop everything
./docker-start.sh logs      # View logs
./docker-start.sh help      # See all options
```

## Option 2: Manual Setup (Running without Docker)

This is for running the frontend and backend services directly on your machine without Docker, primarily for development.

**Prerequisites**: Python 3.8+, Node.js 16+, and Git.

1.  **Clone the Repository**:
    First, clone the repository to get the source code:
    ```bash
    git clone https://github.com/murtaza-nasir/pdf3md.git
    cd pdf3md 
    ```

2.  **Set up Backend (Terminal 1)**:
    Navigate to the application's backend directory and install dependencies:
    ```bash
    cd pdf3md # If you are in the root of the cloned repo, cd into pdf3md
    pip install -r requirements.txt
    python app.py
    ```

3.  **Set up Frontend (Terminal 2)**:
    In a new terminal, navigate to the same application directory for the frontend:
    ```bash
    cd path/to/your/cloned/pdf3md/pdf3md # Adjust path as necessary
    npm install
    npm run dev
    ```

4.  **Open Browser**:
    *   Frontend: `http://localhost:5173`
    *   Backend API: `http://localhost:6201`
```

## Using the App

1. **Open** http://localhost:3000 (or http://localhost:5173 for development mode).
2. For **PDF to Markdown**:
    - **Drag & drop** one or more PDF files or click to upload.
    - **Watch** the conversion progress.
    - **Copy** the generated Markdown text.
3. For **Markdown to Word**:
    - Switch to "MD → Word" mode in the application.
    - Paste or type your Markdown content.
    - Click "Download as Word" to get the DOCX file.

## Need Help?

- Check the full [README.md](README.md) for detailed instructions
- View logs: `./docker-start.sh logs`
- Stop everything: `./docker-start.sh stop`

**Happy converting!**
