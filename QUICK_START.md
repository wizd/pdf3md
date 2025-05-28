# 🚀 Quick Start Guide

Get PDF3MD running in under 2 minutes!

## Option 1: Docker (Recommended) 🐳

**Prerequisites**: Docker installed on your system

```bash
# 1. Clone and enter directory
git clone https://github.com/murtaza-nasir/pdf3md.git
cd pdf3md

# 2. Start the application
./docker-start.sh start

# 3. Open in browser
# Frontend: http://localhost:3000
# Backend: http://localhost:6201
```

**That's it!** 🎉

### Development Mode
```bash
./docker-start.sh dev
# Frontend with hot-reload: http://localhost:5173
```

### Useful Commands
```bash
./docker-start.sh status    # Check what's running
./docker-start.sh stop      # Stop everything
./docker-start.sh logs      # View logs
./docker-start.sh help      # See all options
```

## Option 2: Manual Setup 🛠️

**Prerequisites**: Python 3.8+, Node.js 16+

```bash
# 1. Clone and setup
git clone https://github.com/murtaza-nasir/pdf3md.git
cd pdf3md/pdf3md

# 2. Backend (Terminal 1)
pip install -r requirements.txt
python app.py

# 3. Frontend (Terminal 2)
npm install
npm run dev

# 4. Open browser
# Frontend: http://localhost:5173
# Backend: http://localhost:6201
```

## Using the App 📄

1. **Open** http://localhost:3000 (or 5173 for dev)
2. **Drag & drop** a PDF file or click to upload
3. **Watch** the conversion progress
4. **Copy** the generated Markdown text

## Need Help? 🆘

- Check the full [README.md](README.md) for detailed instructions
- View logs: `./docker-start.sh logs`
- Stop everything: `./docker-start.sh stop`

**Happy converting!** ✨
