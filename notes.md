maid -o output.md --pattern "node_modules*" --pattern "package-lock.json" pdf3md --verbose


ps aux | grep "python3.*app.py"

ps aux | grep "vite.*pdf3md"

sudo lsof -ti :5173
sudo lsof -ti :6201








screen -S pdf3md
# Then run your start script
./start_server.sh
# Press Ctrl+A then D to detach
