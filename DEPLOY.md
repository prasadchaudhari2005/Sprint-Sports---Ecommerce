# Deployment Guide (Free Forever)

This guide explains how to deploy your application for **free** using **Render** (for the Node.js app) and **TiDB Cloud** (for the MySQL database).

## Prerequisites
- A GitHub account.
- A [Render](https://render.com/) account (Sign up with GitHub).
- A [TiDB Cloud](https://tidbcloud.com/) account (Sign up with Google/GitHub - **No Credit Card Required**).

---

## Step 1: Create a Free MySQL Database (TiDB Cloud)
1.  Log in to [TiDB Cloud](https://tidbcloud.com/).
2.  Click **"Create Cluster"**.
3.  Select **"Serverless"** (This is the Free Forever plan).
4.  Region: Choose the one closest to you (e.g., **Mumbai** if available, or Singapore).
5.  Cluster Name: `sport-app-db`.
6.  Click **"Create"**.
7.  **Set Password**: It will ask you to set a password for the root user. **Copy this password!**
8.  Click **"Connect"** (top right) to get your details:
    - **Host**: (e.g., `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
    - **Port**: `4000`
    - **User**: (e.g., `2RlOxxxx.root`)

---

## Step 2: Import Your Database Schema
You can check if TiDB has a "Chat2Query" or SQL Editor in the browser.
1.  Go to the **"SQL Editor"** tab in TiDB Cloud.
2.  Copy the contents of your `db/schema.sql` file.
3.  Paste them into the editor and clicking **"Run"**.

*Alternatively*, usually you can connect via a local terminal:
```bash
mysql -u <USER> -h <HOST> -P 4000 -p --ssl-mode=VERIFY_IDENTITY --ssl-ca=/path/to/ca.pem
```
*(TiDB usually provides a connection string you can copy-paste).*

---

## Step 3: Deploy App to Render
1.  Log in to [Render Dashboard](https://dashboard.render.com/).
2.  Click **"New +"** > **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Configure the Service**:
    - **Name**: `sport-app`.
    - **Region**: Singapore (closest to India).
    - **Runtime**: `Node`.
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
    - **Plan**: Select **"Free"**.

5.  **Environment Variables**:
    Add these in the "Environment Variables" section:

    | Key | Value |
    | :--- | :--- |
    | `PORT` | `10000` |
    | `DB_HOST` | *Your TiDB Host* |
    | `DB_USER` | *Your TiDB User* |
    | `DB_PASSWORD` | *Your TiDB Password* |
    | `DB_NAME` | `test` (Default TiDB DB name, or create a new one) |
    | `DB_PORT` | `4000` |
    | `RAZORPAY_KEY_ID` | *Your Razorpay Key ID* |
    | `RAZORPAY_KEY_SECRET` | *Your Razorpay Key Secret* |

    *Note:* TiDB requires a secure connection. Your `mysql2` driver usually handles this automatically, but if you see errors, ensure `ssl: { rejectUnauthorized: true }` is in your db config (it defaults to mostly working).

6.  Click **"Create Web Service"**.

---

## Step 4: Verify
1.  Wait for Render to build (can take 5 mins).
2.  Visit your new URL.
3.  **Note**: Rentder Free Tier "sleeps" after 15 mins of inactivity. The first load might take 45 seconds.

---

## Privacy Note
All credentials are safely stored in Render's Environment Variables.
