# **Breadit**

A full stack reddit clone that delivers a seamless user experience, from creating subreddits to sharing captivating text and image posts.

The live project is hosted at https://breadit.adhupraba.com/

---

## **Table of Contents**

- [Setup Instructions](#setup-instructions)
  - [Running with Docker](#running-with-docker)
  - [Running Locally](#running-locally)
    - [Backend Setup](#backend-setup-django-server)
    - [Frontend Setup](#frontend-setup-react-client)
- [Generating Unique Secret Keys](#secret-keys)
- [Cross Site Cookies](#cross-site-cookies)
- [API Access](#api-access)

---

## **Setup Instructions**

### **Running with Docker**

The project includes a Docker setup for running both the client and server simultaneously.

1. **Setup Environment Variables**:

- In the project root, copy `.env.example` to `.env`:

  ```bash
  cp .env.client.example .env.client
  cp .env.server.example .env.server
  ```

- Update the `.env.client` and `.env.server` files with appropriate values.

- Please generate unique keys for secret env variables at the time of running the application for better security. See [Generating Unique Secret Keys](#secret-keys) section.

2. Connecting to local database and redis from the Docker containers

> Note: Step 2 not needed if you are using a cloud hosted database/redis or a postgres/redis service in the compose file.

- If you are using a local database and local redis server and want to connect to the application, some changes to the env are needed.

- Identify the `docker0` interface's ip address:

  ```bash
  ip addr show docker0
  ```

- Copy the `inet` ipv4 address. It will look like this `127.17.0.1`.

- Update the `/etc/hosts` in the host machine.

  ```bash
  172.17.0.1 host.docker.internal
  ```

- Update the hostname of database and redis urls in .env.server

  ```bash
  DB_URL=postgresql://<user>:<password>@172.17.0.1:5432/<dbname>
  REDIS_URL=redis://172.17.0.1:6379
  ```

3. **Build and Run the Docker Containers**:

- From the project root directory, run:

  ```bash
  docker compose -f docker-compose.dev.yaml up --build
  ```

4. **Access the application**:

- Frontend: `http://localhost:2800/`

- Backend: `http://localhost:2801/gateway/`

### **Running Locally**

#### **Backend Setup (Go Server)**

1. **Navigate to the Server Directory**:

```bash
cd server
```

2. **Install Dependencies**:

```bash
go install github.com/pressly/goose/v3/cmd/goose@latest
go install github.com/githubnemo/CompileDaemon@latest
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
go mod tidy
```

3. **Setup Environment Variables**:

- Copy `.env.example` to `.env`:

  ```bash
  cp .env.example .env
  ```

- Update the `.env` file with appropriate values

- Please generate unique keys at the time of running the application for better security. See [Generating Unique Secret Keys](#secret-keys) section.

4. **To generate SQL migrations**

```bash
goose create <model_name> sql
```

5. **Apply Migrations**:

```bash
sh migrate.sh
```

6. **During development, to generate Go code for the SQL migrations and queries**:

```bash
sqlc generate
```

7. **Start the dev server**:

```bash
CompileDaemon --command="./breadit-server"
```

8. **Build for production**:

- General production build

  - Generate build executable

    ```bash
    go build -tags netgo -ldflags '-s -w' -o breadit-server
    ```

  - Run the server

    ```bash
    ./breadit-server
    ```

- To produce a more compressed and efficient executable

  - Install `upx` package from `apt`

    ```bash
    sudo apt install upx
    ```

  - Generate build executable

    ```bash
    go build -tags netgo -ldflags '-s -w' -o breadit-server
    ```

  - Generate a `upx` executable

    ```bash
    upx --best --lzma -o breadit-server.upx breadit-server
    ```

  - Run the `upx` executable

    ```bash
    ./breadit-server.upx
    ```

---

#### **Frontend Setup (Next.js)**

1. **Navigate to the Client Directory**:

```bash
cd client
```

2. **Install Dependencies**:

```bash
npm install
```

3. **Setup Environment Variables**:

- Copy `.env.example` to `.env`:

  ```bash
  cp .env.example .env
  ```

- Update the `.env` file with appropriate values

- Please generate unique keys at the time of running the application for better security. See [Generating Unique Secret Keys](#secret-keys) section.

4. **Start the Frontend Development Server**:

```bash
npm run dev
```

5. **Build for production**

```bash
npm run build
```

---

## **Generating Unique Secret Keys**

```bash
  # generates 32 bytes key (use this for generating secret and file encryption key)
  openssl enc -aes-128-cbc -k secret -P -md sha1

  # generates 64 bytes key (use this for generating jwt secrets)
  openssl enc -aes-256-cbc -k secret -P -md sha1
```

---

## **Cross Site Cookies**

> Cross site cookies are cookies set in the client from a different domain. Client and server are under different domains. eg: Client - http://localhost:2800 or https://www.abc.com, Server - http://localhost:2801 or https://www.def.com

Normally cross-site cookies are not sent to the server if server is in a different domain. So as a work around what is done is to implement a `api path rewrite` in the `next.config.js`

All backend requests from the ui are made to a dummy `<frontend_url>/gateway/...` nextjs endpoint which in turn gets redirected to the actual backend api due to the rewrite rule.

> This backend api path rewrite is implemented only for local development. In production it is better to handle using a web server like `nginx` or `apache`.

In this way we are able to send our own cross site cookies to our server which was previously not possible

---

## **API Access**

To test backend endpoints, use tools like Postman or curl.
Example endpoint for health check:

```bash
POST http://localhost:2801/gateway/health/heartbeat/
```

---

You’re now ready to run and develop Breadit locally or using Docker! 🚀
