# Deployment Guide (Render + Freesqldatabase)

This guide explains how to deploy your application using **Render** (Node.js) and **Freesqldatabase** (MySQL).

## Prerequisites
- A GitHub account.
- A [Render](https://render.com/) account.
- A [Freesqldatabase.com](https://www.freesqldatabase.com/) account.

---

## Step 1: Create Database (Freesqldatabase)
1.  Go to [www.freesqldatabase.com](https://www.freesqldatabase.com/) and sign up.
2.  After logging in, click **"Start Database"** (or "Create Database").
3.  They will send you an **Email** with your database details:
    - **Host** (e.g., `sql.freesqldatabase.com`)
    - **Database Name** (e.g., `sql1234567`)
    - **Username** (e.g., `sql1234567`)
    - **Password**
    - **Port**: `3306`

---

## Step 2: Import Schema
You can use the built-in phpMyAdmin provided by Freesqldatabase.
1.  In the Freesqldatabase dashboard, click **"phpMyAdmin"**.
2.  Log in with the credentials from the email.
3.  Click on your database name on the left sidebar.
4.  Click the **"Import"** tab (top menu).
5.  Click **"Choose File"** and select your `db/schema.sql` file.
6.  Click **"Go"** to run the script and create tables.

---

## Step 3: Deploy App to Render
1.  Log in to [Render Dashboard](https://dashboard.render.com/).
2.  Click **"New +"** > **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Configure**:
    - **Name**: `sport-app`.
    - **Region**: Singapore (or nearest).
    - **Runtime**: `Node`.
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
    - **Plan**: **"Free"**.

5.  **Environment Variables**:
    Add these in the "Environment Variables" section:

    | Key | Value |
    | :--- | :--- |
    | `PORT` | `10000` |
    | `DB_HOST` | *Host from Email* |
    | `DB_USER` | *Username from Email* |
    | `DB_PASSWORD` | *Password from Email* |
    | `DB_NAME` | *Database Name from Email* |
    | `DB_PORT` | `3306` |
    | `RAZORPAY_KEY_ID` | *Your Razorpay Key ID* |
    | `RAZORPAY_KEY_SECRET` | *Your Razorpay Key Secret* |

6.  Click **"Create Web Service"**.

---

## Step 4: Verify
1.  Wait for Render to build.
2.  Visit the URL.
3.  Use "Buy Now" to test the connection.
