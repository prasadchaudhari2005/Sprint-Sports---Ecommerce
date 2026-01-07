# Deployment Guide (Railway)

This guide explains how to deploy your application to **Railway** with MySQL and privacy settings.

## Prerequisites
- A GitHub account (you already have this).
- A [Railway](https://railway.app/) account (Sign up with GitHub).

## Steps

### 1. Connect to Railway
1.  Log in to [Railway](https://railway.app/).
2.  Click **"New Project"** > **"Deploy from GitHub repo"**.
3.  Select your repository: `Sprint-Sports---Ecommerce`.
4.  Click **"Deploy Now"**.

### 2. Add MySQL Database
1.  In your project dashboard, click **"New"** (or right-click on the canvas).
2.  Select **"Database"** > **"MySQL"**.
3.  Railway will create a text database service. Wait for it to initialize.

### 3. Configure Environment Variables
1.  Click on your **Node.js service** (the box with your repo name).
2.  Go to the **"Variables"** tab.
3.  Click **"New Variable"** multiple times to add the following:

    | Variable Name | Value |
    | :--- | :--- |
    | `PORT` | `8080` (or leave blank, Railway sets this automatically usually) |
    | `DB_HOST` | `${{MySQL.MYSQLHOST}}` (Click "Reference" to select this) |
    | `DB_USER` | `${{MySQL.MYSQLUSER}}` |
    | `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
    | `DB_NAME` | `${{MySQL.MYSQL_DATABASE}}` |
    | `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
    | `RAZORPAY_KEY_ID` | *Your actual Razorpay Key ID* |
    | `RAZORPAY_KEY_SECRET` | *Your actual Razorpay Key Secret* |

    > **Note:** The `${{MySQL...}}` values are "Reference Variables". When typing the value, type `$` and select the variable from the dropdown Railway provides. This ensures you don't copy-paste sensitive passwords manually.

### 4. Import Database Schema
1.  Click on the **MySQL service**.
2.  Go to the **"Data"** tab (or "Connect").
3.  Copy the **"MySQL Connection URL"**.
4.  Use a tool like **MySQL Workbench** or a CLI to connect to this remote database and run the contents of your `db/schema.sql` file to create the tables.
    - *Alternatively*, you can use Railway's built-in query editor if available, or just connect via your local terminal:
      ```bash
      mysql -h <RAILWAY_HOST> -u <USER> -p<PASSWORD> -P <PORT> --default-character-set=utf8mb4 < db/schema.sql
      ```

### 5. Verify Deployment
1.  Once variables are set, Railway usually triggers a redeploy. If not, go to "Deployments" and click "Redeploy".
2.  Once the status is "Active", click the **Generated URL** to view your live site.
3.  Test the "Buy Now" feature to verify Razorpay and Database connections.

## Privacy Note
Your passwords and keys are now stored safely in Railway's "Variables" section and are **NOT** in the GitHub code.
