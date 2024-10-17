# **Project Setup**

## **Prerequisites**

**Global Dependency**: Ensure you have **Deno v2.0** or higher installed on your
system.

## **Installing Project Dependencies**

To install the required dependencies, run the following command:

```bash
$ deno install
```

## Configuration

Before running the application, you need to set up an API key for The Movie
Database (TMDb). Follow these steps:

- Create a `.env` file: A template for the .env file can be found at
  [this location](../env/.env.template). Use this template to create a .env file
  in the same directory, and replace the placeholder with your actual TMDb API
  key.

## Running the Application

Once the `.env` file is properly configured, you can start the application by
executing the following command:

```bash
$ deno run start <absolute_path_to_file>

# Replace <absolute_path_to_file> with the absolute path of the file or directory you want the app to process.

# Ensure that you have the necessary permissions enabled for Deno to read files, write files, and access the network.
```
