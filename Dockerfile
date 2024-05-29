# Use an official Python runtime as a parent image
FROM python:3.11.5-bookworm
# Install nodejs
RUN apt-get update && apt-get install -y npm
# install zip
RUN apt-get install -y zip
# Install react
#RUN npm install react
# Make app directory in container
RUN mkdir /app

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt


# Set the working directory to /app/client
WORKDIR /app/client

# Install rpm packages from package.json
RUN npm install --force

# Build the app
RUN npm run build

# Set the working directory back to /app
WORKDIR /app

# Define environment variable
#ENV NAME World

# Make port 8080 available to the world outside this container
EXPOSE 8080

RUN chmod -R 777 server
# Set the working directory to /app/client
WORKDIR /app/server
#set the permissions on app/server/permanent_storage to drwxrwxrwx
RUN chmod -R 777 permanent_storage
#set the permissions on app/server/permanent_storage to drwxrwxrwx
RUN chmod -R 777 PyNutil
# Run app.py when the container launches
CMD ["bash", "-c", "FLASK_APP=app.py flask run --host=0.0.0.0 --port=8080"]
