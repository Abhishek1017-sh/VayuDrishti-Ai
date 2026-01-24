#!/bin/bash

# VayuDrishti - Water Tank Level Simulator
# Simulates ultrasonic/float sensor readings from ESP32

# Color codes for output
RED='\033[0;31m'
ORANGE='\033[0;33m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
SERVER_URL="${SERVER_URL:-http://localhost:9000/api/water-tanks/level}"
TANK_ID="${TANK_ID:-TANK_001}"
SENSOR_DEVICE_ID="${SENSOR_DEVICE_ID:-ESP32_TANK_01}"
ZONE="${ZONE:-Zone A}"
LATITUDE="${LATITUDE:-28.6139}"
LONGITUDE="${LONGITUDE:-77.2090}"
LOG_FILE="water-tank-test.log"

# Test counters
TOTAL_REQUESTS=0
SUCCESS_COUNT=0
FAILED_COUNT=0

# Function: Print colored banner
print_banner() {
    echo ""
    echo -e "${CYAN}=========================================${NC}"
    echo -e "${BOLD}${BLUE}  💧 VayuDrishti - Water Tank Simulator${NC}"
    echo -e "${CYAN}  Testing Water Resource Monitoring${NC}"
    echo -e "${CYAN}=========================================${NC}"
    echo ""
}

# Function: Print configuration
print_config() {
    echo -e "${BOLD}Configuration:${NC}"
    echo -e "  🎯 Server: ${CYAN}$SERVER_URL${NC}"
    echo -e "  🏗️  Tank ID: ${CYAN}$TANK_ID${NC}"
    echo -e "  📱 Sensor: ${CYAN}$SENSOR_DEVICE_ID${NC}"
    echo -e "  📍 Zone: ${CYAN}$ZONE${NC}"
    echo -e "  🌍 Location: ${CYAN}$LATITUDE°N, $LONGITUDE°E${NC}"
    echo -e "  📝 Log File: ${CYAN}$LOG_FILE${NC}"
    echo ""
}

# Function: Get status color based on water level
get_status_color() {
    local level=$1
    if [ $level -ge 40 ]; then
        echo -e "${GREEN}"
    elif [ $level -ge 20 ]; then
        echo -e "${YELLOW}"
    elif [ $level -ge 5 ]; then
        echo -e "${ORANGE}"
    else
        echo -e "${RED}"
    fi
}

# Function: Get status text based on water level
get_status_text() {
    local level=$1
    if [ $level -ge 40 ]; then
        echo "NORMAL"
    elif [ $level -ge 20 ]; then
        echo "LOW"
    elif [ $level -ge 5 ]; then
        echo "CRITICAL"
    else
        echo "EMPTY"
    fi
}

# Function: Send water level data
send_water_level() {
    local level=$1
    local scenario_name=$2
    
    TOTAL_REQUESTS=$((TOTAL_REQUESTS + 1))
    
    local status_color=$(get_status_color $level)
    local status_text=$(get_status_text $level)
    
    # Prepare JSON payload
    local payload=$(cat <<EOF
{
  "tankId": "$TANK_ID",
  "waterLevel": $level,
  "sensorDeviceId": "$SENSOR_DEVICE_ID",
  "zone": "$ZONE",
  "location": {
    "lat": $LATITUDE,
    "long": $LONGITUDE
  }
}
EOF
)
    
    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}[$scenario_name]${NC}"
    echo -e "📊 Sending: Tank=${CYAN}$TANK_ID${NC}, Level=${status_color}$level%${NC}, Status=${status_color}$status_text${NC}"
    echo -e "📍 Location: ${CYAN}$LATITUDE°N, $LONGITUDE°E${NC}"
    echo -e "🕒 Timestamp: ${CYAN}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
    
    # Send request and capture response
    local response=$(curl -s -w "\n%{http_code}" -X POST "$SERVER_URL" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>&1)
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    # Log to file
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Level: $level%, Status: $status_text, HTTP: $http_code" >> "$LOG_FILE"
    
    # Display response
    echo -e "${BOLD}Response:${NC}"
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo -e "  ${GREEN}✅ Success (HTTP $http_code)${NC}"
        
        # Parse response for key information
        local municipality_notified=$(echo "$body" | grep -o '"notified":[^,]*' | cut -d: -f2 | tr -d ' ')
        local sprinklers_disabled=$(echo "$body" | grep -o '"sprinklersDisabled":[^,]*' | cut -d: -f2 | tr -d ' ')
        
        if [ "$municipality_notified" = "true" ]; then
            echo -e "  ${ORANGE}📬 Municipality notification: YES${NC}"
        fi
        
        if [ "$sprinklers_disabled" = "true" ]; then
            echo -e "  ${RED}🚿 Sprinklers disabled: YES${NC}"
        else
            echo -e "  ${GREEN}🚿 Sprinklers available: YES${NC}"
        fi
        
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
        echo -e "  ${RED}❌ Failed (HTTP $http_code)${NC}"
        echo -e "  ${RED}Error: $body${NC}"
    fi
    
    echo ""
}

# Function: Scenario 1 - Normal Operation
scenario_normal() {
    echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Scenario 1: Normal Operation (Random 60-100%)${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    for i in {1..5}; do
        local level=$((60 + RANDOM % 41))  # 60-100%
        send_water_level $level "Normal Operation #$i"
        sleep 3
    done
}

# Function: Scenario 2 - Gradual Depletion
scenario_depletion() {
    echo -e "${BOLD}${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Scenario 2: Gradual Depletion (80% → 0%)${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    local levels=(80 65 50 38 25 15 8 3)
    for level in "${levels[@]}"; do
        send_water_level $level "Gradual Depletion"
        sleep 4
    done
}

# Function: Scenario 3 - Critical Alert Test
scenario_critical() {
    echo -e "${BOLD}${ORANGE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Scenario 3: Critical Alert Test (50% → 15%)${NC}"
    echo -e "${ORANGE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    send_water_level 50 "Critical Test - Start"
    sleep 3
    send_water_level 15 "Critical Test - CRITICAL TRIGGERED"
    sleep 3
}

# Function: Scenario 4 - Empty Tank Test
scenario_empty() {
    echo -e "${BOLD}${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Scenario 4: Empty Tank Test (Drop to 3%)${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    send_water_level 25 "Empty Test - Start"
    sleep 3
    send_water_level 3 "Empty Test - EMERGENCY"
    sleep 3
}

# Function: Scenario 5 - Refill Simulation
scenario_refill() {
    echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Scenario 5: Refill Simulation (5% → 85%)${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    send_water_level 5 "Refill - Start (Empty)"
    sleep 3
    send_water_level 25 "Refill - Rising"
    sleep 3
    send_water_level 50 "Refill - Recovery"
    sleep 3
    send_water_level 85 "Refill - NORMAL Restored"
    sleep 3
}

# Function: Scenario 6 - All Threshold Crossings
scenario_thresholds() {
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Scenario 6: Threshold Crossing Tests${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    local transitions=(
        "100:NORMAL (100%)"
        "35:NORMAL → LOW (35%)"
        "15:LOW → CRITICAL (15%)"
        "3:CRITICAL → EMPTY (3%)"
        "80:EMPTY → NORMAL (80% - Refilled)"
    )
    
    for transition in "${transitions[@]}"; do
        local level=$(echo $transition | cut -d: -f1)
        local desc=$(echo $transition | cut -d: -f2)
        send_water_level $level "Threshold: $desc"
        sleep 4
    done
}

# Function: Auto-loop mode
auto_loop_mode() {
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Auto-Loop Mode: Continuous Random Testing${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Press ${RED}Ctrl+C${NC} to stop"
    echo ""
    
    local counter=1
    while true; do
        local level=$((RANDOM % 101))  # 0-100%
        send_water_level $level "Auto-Loop #$counter"
        counter=$((counter + 1))
        sleep 5
    done
}

# Function: Print statistics
print_stats() {
    echo ""
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Test Statistics${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  Total Requests: ${CYAN}$TOTAL_REQUESTS${NC}"
    echo -e "  Successful: ${GREEN}$SUCCESS_COUNT${NC}"
    echo -e "  Failed: ${RED}$FAILED_COUNT${NC}"
    
    if [ $TOTAL_REQUESTS -gt 0 ]; then
        local success_rate=$((SUCCESS_COUNT * 100 / TOTAL_REQUESTS))
        echo -e "  Success Rate: ${CYAN}$success_rate%${NC}"
    fi
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function: Show menu
show_menu() {
    echo -e "${BOLD}Select Test Scenario:${NC}"
    echo ""
    echo -e "  ${GREEN}1${NC} - Normal Operation (60-100%)"
    echo -e "  ${YELLOW}2${NC} - Gradual Depletion (80% → 0%)"
    echo -e "  ${ORANGE}3${NC} - Critical Alert Test (50% → 15%)"
    echo -e "  ${RED}4${NC} - Empty Tank Test (Drop to 3%)"
    echo -e "  ${GREEN}5${NC} - Refill Simulation (5% → 85%)"
    echo -e "  ${CYAN}6${NC} - All Threshold Crossings"
    echo -e "  ${BLUE}7${NC} - Auto-Loop Mode (Continuous)"
    echo -e "  ${BOLD}8${NC} - Run All Scenarios Sequentially"
    echo -e "  ${RED}9${NC} - Exit"
    echo ""
    echo -n "Enter choice [1-9]: "
}

# Main execution
main() {
    print_banner
    print_config
    
    # Initialize log file
    echo "# VayuDrishti Water Tank Test Log - $(date)" > "$LOG_FILE"
    
    while true; do
        show_menu
        read choice
        
        case $choice in
            1) scenario_normal ;;
            2) scenario_depletion ;;
            3) scenario_critical ;;
            4) scenario_empty ;;
            5) scenario_refill ;;
            6) scenario_thresholds ;;
            7) auto_loop_mode ;;
            8)
                scenario_normal
                scenario_depletion
                scenario_critical
                scenario_empty
                scenario_refill
                scenario_thresholds
                ;;
            9)
                print_stats
                echo -e "${GREEN}Thank you for testing VayuDrishti Water Tank Monitoring!${NC}"
                echo ""
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid choice. Please select 1-9.${NC}"
                ;;
        esac
        
        print_stats
        echo ""
        echo -e "Press ${CYAN}Enter${NC} to continue..."
        read
    done
}

# Trap Ctrl+C
trap 'echo -e "\n${YELLOW}Test interrupted by user${NC}"; print_stats; exit 0' INT

# Run main
main
