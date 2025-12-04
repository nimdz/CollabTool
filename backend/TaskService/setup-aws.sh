#!/bin/bash

echo "Setting up AWS DynamoDB for .NET project on Arch Linux"

# Install AWS CLI if not present
if ! command -v aws &> /dev/null; then
    echo "Installing AWS CLI..."
    sudo pacman -S aws-cli --noconfirm
fi

# ... (instructions for user remain the same) ...

# Create DynamoDB tables
echo "Creating DynamoDB tables..."

# Create Tasks table
echo "Creating Tasks table..."
# MODIFICATION HERE
aws dynamodb create-table --cli-input-json file://tasks-table.json --region us-east-1 --profile vitalhub

echo "Waiting for Tasks table to be active..."
# MODIFICATION HERE
aws dynamodb wait table-exists --table-name Tasks --region us-east-1 --profile vitalhub

# Create Projects table
echo "Creating Projects table..."
# MODIFICATION HERE
aws dynamodb create-table --cli-input-json file://projects-table.json --region us-east-1 --profile vitalhub

echo "Waiting for Projects table to be active..."
# MODIFICATION HERE
aws dynamodb wait table-exists --table-name Projects --region us-east-1 --profile vitalhub

echo "Setup complete! Run 'dotnet run' in the TaskService directory to start the API."