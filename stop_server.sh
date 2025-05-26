#!/bin/bash

# Define the PID directory
PID_DIR=".pids"
BACKEND_PID_FILE="$PID_DIR/backend.pid"
FRONTEND_PID_FILE="$PID_DIR/frontend.pid"

# Function to stop a process given its PID file and name
stop_process() {
  local pid_file=$1
  local process_name=$2

  if [ -f "$pid_file" ]; then
    # Read the PID from the file
    pid=$(cat "$pid_file")

    # Check if a PID was read and if the process exists
    if [ -n "$pid" ] && ps -p "$pid" > /dev/null; then
      echo "Attempting to stop $process_name (PID $pid)..."
      # Send the TERM signal (graceful shutdown)
      kill "$pid"
      
      # Wait for a moment to allow graceful shutdown
      sleep 2

      # Check if the process is still running
      if ps -p "$pid" > /dev/null; then
        echo "$process_name (PID $pid) did not stop gracefully. Forcing termination..."
        # Send the KILL signal (forceful shutdown)
        kill -9 "$pid"
        sleep 1 # Give a moment for the force kill
      fi

      # Final check and cleanup
      if ! ps -p "$pid" > /dev/null; then
        echo "$process_name (PID $pid) has been stopped."
        # Remove the PID file
        rm "$pid_file"
      else
        echo "Error: Could not stop $process_name (PID $pid)."
      fi
    else
      echo "$process_name PID file found, but no process with PID $pid is running. Removing PID file."
      rm "$pid_file"
    fi
  else
    echo "$process_name PID file not found. It might already be stopped or the file was removed."
  fi
}

# Stop the backend server
stop_process "$BACKEND_PID_FILE" "Backend server"

# Stop the frontend server
stop_process "$FRONTEND_PID_FILE" "Frontend server"

# Optional: Attempt to remove the .pids directory if it's empty
if [ -d "$PID_DIR" ] && [ -z "$(ls -A $PID_DIR)" ]; then
  echo "Removing empty PID directory: $PID_DIR"
  rmdir "$PID_DIR"
fi

echo "Stop script execution finished."