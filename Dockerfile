FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install Node.js and system deps
RUN apt-get update && apt-get install -y curl gnupg build-essential \
 && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
 && apt-get install -y nodejs \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt numpy

# Copy entire project
COPY . .

# Install frontend deps and build
WORKDIR /app
RUN npm install && npm run build


# Make the start script executable
RUN chmod +x start.sh

# Expose frontend port
EXPOSE 3000

# Run both frontend and backend
CMD ["./start.sh"]
