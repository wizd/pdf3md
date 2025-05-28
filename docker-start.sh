#!/bin/bash

# PDF3MD Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to start production environment
start_production() {
    print_status "Starting PDF3MD in production mode..."
    docker compose up -d
    
    if [ $? -eq 0 ]; then
        print_success "PDF3MD is now running!"
        echo ""
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔧 Backend API: http://localhost:6201"
        echo ""
        echo "To view logs: docker compose logs -f"
        echo "To stop: docker compose down"
    else
        print_error "Failed to start PDF3MD"
        exit 1
    fi
}

# Function to start development environment
start_development() {
    print_status "Starting PDF3MD in development mode..."
    docker compose -f docker-compose.dev.yml up -d
    
    if [ $? -eq 0 ]; then
        print_success "PDF3MD development environment is now running!"
        echo ""
        echo "🌐 Frontend (with hot-reload): http://localhost:5173"
        echo "🔧 Backend API: http://localhost:6201"
        echo ""
        echo "To view logs: docker compose -f docker-compose.dev.yml logs -f"
        echo "To stop: docker compose -f docker-compose.dev.yml down"
    else
        print_error "Failed to start PDF3MD development environment"
        exit 1
    fi
}

# Function to stop all environments
stop_all() {
    print_status "Stopping all PDF3MD environments..."
    
    # Stop production
    if docker compose ps -q > /dev/null 2>&1; then
        print_status "Stopping production environment..."
        docker compose down
    fi
    
    # Stop development
    if docker compose -f docker-compose.dev.yml ps -q > /dev/null 2>&1; then
        print_status "Stopping development environment..."
        docker compose -f docker-compose.dev.yml down
    fi
    
    print_success "All PDF3MD environments stopped"
}

# Function to show status
show_status() {
    print_status "PDF3MD Environment Status:"
    echo ""
    
    echo "Production Environment:"
    if docker compose ps -q > /dev/null 2>&1 && [ -n "$(docker compose ps -q)" ]; then
        docker compose ps
    else
        echo "  Not running"
    fi
    
    echo ""
    echo "Development Environment:"
    if docker compose -f docker-compose.dev.yml ps -q > /dev/null 2>&1 && [ -n "$(docker compose -f docker-compose.dev.yml ps -q)" ]; then
        docker compose -f docker-compose.dev.yml ps
    else
        echo "  Not running"
    fi
}

# Function to rebuild and start
rebuild() {
    print_status "Rebuilding and starting PDF3MD..."
    
    if [ "$1" = "dev" ]; then
        docker compose -f docker-compose.dev.yml down
        docker compose -f docker-compose.dev.yml up -d --build
        print_success "Development environment rebuilt and started!"
    else
        docker compose down
        docker compose up -d --build
        print_success "Production environment rebuilt and started!"
    fi
}

# Function to show help
show_help() {
    echo "PDF3MD Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start, prod     Start production environment"
    echo "  dev             Start development environment"
    echo "  stop            Stop all environments"
    echo "  status          Show status of all environments"
    echo "  rebuild [dev]   Rebuild and start (add 'dev' for development)"
    echo "  logs [dev]      Show logs (add 'dev' for development)"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start        # Start production"
    echo "  $0 dev          # Start development"
    echo "  $0 rebuild dev  # Rebuild development environment"
    echo "  $0 logs         # Show production logs"
}

# Function to show logs
show_logs() {
    if [ "$1" = "dev" ]; then
        print_status "Showing development environment logs..."
        docker compose -f docker-compose.dev.yml logs -f
    else
        print_status "Showing production environment logs..."
        docker compose logs -f
    fi
}

# Main script logic
check_docker

case "${1:-help}" in
    "start"|"prod")
        start_production
        ;;
    "dev")
        start_development
        ;;
    "stop")
        stop_all
        ;;
    "status")
        show_status
        ;;
    "rebuild")
        rebuild "$2"
        ;;
    "logs")
        show_logs "$2"
        ;;
    "help"|*)
        show_help
        ;;
esac
