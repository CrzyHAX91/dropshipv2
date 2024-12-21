#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display help message
show_help() {
    echo -e "${GREEN}Dropship Platform Startup Script${NC}"
    echo
    echo "Usage: ./start-services.sh [mode]"
    echo
    echo "Modes:"
    echo "  dev       - Start in development mode (default)"
    echo "  prod      - Start in production mode"
    echo "  docker    - Start using Docker containers"
    echo "  stop      - Stop all running services"
    echo "  clean     - Clean up build files and node_modules"
    echo
    echo "Examples:"
    echo "  ./start-services.sh dev"
    echo "  ./start-services.sh prod"
    echo "  ./start-services.sh docker"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check dependencies
check_dependencies() {
    local missing_deps=()

    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    if [ "$1" = "docker" ] && ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    if [ "$1" = "docker" ] && ! command_exists docker-compose; then
        missing_deps+=("Docker Compose")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}Error: Missing required dependencies:${NC}"
        printf '%s\n' "${missing_deps[@]}"
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm run install-all
}

# Function to start development mode
start_dev() {
    echo -e "${GREEN}Starting in development mode...${NC}"
    npm run start
}

# Function to start production mode
start_prod() {
    echo -e "${GREEN}Starting in production mode...${NC}"
    cd dropship-frontend && npm run build && cd ..
    NODE_ENV=production npm run start
}

# Function to start Docker mode
start_docker() {
    echo -e "${GREEN}Starting with Docker...${NC}"
    docker-compose up --build
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    if [ -f "docker-compose.yml" ]; then
        docker-compose down
    fi
    pkill -f "node.*dropship"
}

# Function to clean up
clean_up() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    rm -rf node_modules
    rm -rf dropship-frontend/node_modules dropship-frontend/build
    rm -rf dropship-backend/node_modules
    rm -rf */*/node_modules
    echo -e "${GREEN}Cleanup complete${NC}"
}

# Main script logic
MODE=${1:-dev}

case $MODE in
    help|-h|--help)
        show_help
        ;;
    dev)
        check_dependencies
        install_dependencies
        start_dev
        ;;
    prod)
        check_dependencies
        install_dependencies
        start_prod
        ;;
    docker)
        check_dependencies docker
        start_docker
        ;;
    stop)
        stop_services
        ;;
    clean)
        clean_up
        ;;
    *)
        echo -e "${RED}Invalid mode: $MODE${NC}"
        show_help
        exit 1
        ;;
esac
