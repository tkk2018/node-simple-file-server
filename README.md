A simple service to upload, list, and download files.

The application currently uses the file system as persistent storage to keep information about uploaded files.

This can be easily changed, as we use Keyv, which supports multiple storage adapters such as SQLite, MySQL, and PostgreSQL.

To install, clone this repository and run:

```
npm install
```

To run the service:

```bash
node index.js
```

To upload a file:

```bash
curl -F "file=@/path/to/filename" http://localhost:3000/upload
```

To list the files:

```bash
curl http://localhost:3000/files
```

To download a file:

```bash
curl http://localhost:3000/download/file.txt -O
```
