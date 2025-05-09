#!/bin/bash

# This script is used to compile all the projects in the cray_noir directory
# It will compile all the projects and copy the output JSON files to the root target directory

# Clear targets directory if it exists, create if it doesn't
if [ -d "targets" ]; then
    echo "Clearing existing targets directory..."
    rm -rf targets/*
else
    echo "Creating targets directory..."
    mkdir -p targets
fi

# Find all directories containing Nargo.toml files
for dir in */; do
    if [ -f "${dir}Nargo.toml" ]; then
        echo "Compiling project in ${dir}..."
        
        # Navigate to the project directory
        cd "${dir}"
        
        # Run nargo compile
        nargo compile
        
        # Check if compilation was successful
        if [ $? -eq 0 ]; then
            # Copy the output JSON file to the root target directory
            # The JSON file is typically named after the project directory
            project_name=$(basename "${dir%/}")
            if [ -f "target/${project_name}.json" ]; then
                cp "target/${project_name}.json" "../targets/"
                echo "Successfully compiled and copied ${project_name}"
            else
                echo "Warning: No JSON file found for ${project_name}"
            fi
        else
            echo "Error: Compilation failed for ${project_name}"
        fi
        
        # Return to the root directory
        cd ..
    fi
done

echo "Build process completed!"
