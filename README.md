# International Research Conference DBMS Portal

Full-stack DBMS project for an academic conference, handling participant registrations, research paper submissions, peer reviews with track sessions, and certificate generation.

## Tech Stack
- **Database**: MySQL 8.0 (`conference_db`)
- **Backend**: Node.js, Express, mysql2/promise, cors
- **Frontend**: HTML5, CSS3, JavaScript (Fetch API)

## Database Connection Details
- **Host**: `localhost`
- **Port**: `3306`
- **User**: `root`
- **Password**: `KKkshitiz1893$@`
- **Database**: `conference_db`

## How to Run
1. Start the server:
   ```bash
   node server.js
   ```
2. Open in your browser:
   [http://localhost:3000](http://localhost:3000)

## Viewing Live Database in MySQL Workbench
1. Open **MySQL Workbench**.
2. Connect to **Local instance MySQL80** using password `dbpasaword`.
3. In the left **Navigator** pane under **Schemas**, expand `conference_db` -> `Tables`.
4. Right-click any table (`participants`, `papers`, `reviews`, `sessions`, `certificates`) and select **Select Rows - Limit 1000**.
5. Submit forms in the web app and click the **Lightning Bolt ⚡** in Workbench to watch updates appear in real-time.
