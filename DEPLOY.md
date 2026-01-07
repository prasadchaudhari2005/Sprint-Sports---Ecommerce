# Deployment Guide (Best Free Method: Render + TiDB)

This is the **best free method** for your project.
- **App Hosting**: Render (Free Tier, no credit card).
- **Database**: TiDB Cloud (5GB Free, no credit card).

## Step 1: Get Database Details (TiDB)
**You already have this!**
1.  Go to your [TiDB Dashboard](https://tidbcloud.com/).
2.  Click **"Connect"** (Top Right).
3.  Copy these values:
    - **Host**
    - **User**
    - **Password** (Reset if you forgot)
    - **Port** (4000)

## Step 2: Initialize Database
1.  In TiDB Dashboard, clicking **"SQL Editor"** (Left Sidebar).
2.  Copy your `db/schema.sql` code.
3.  Paste it in the editor and click **Run**.

## Step 3: Deploy App (Render)
1.  Go to [Render Dashboard](https://dashboard.render.com/).
2.  **New +** -> **Web Service**.
3.  Connect to your GitHub Repo: `Sprint-Sports---Ecommerce`.
4.  **Settings**:
    - **Name**: `sport-app`
    - **Region**: Singapore
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
    - **Plan**: `Free`

5.  **Environment Variables** (Add these):
    | Key | Value |
    | :--- | :--- |
    | `PORT` | `10000` |
    | `DB_HOST` | *(Paste from TiDB)* |
    | `DB_PORT` | `4000` |
    | `DB_USER` | *(Paste from TiDB)* |
    | `DB_PASSWORD` | *(Paste from TiDB)* |
    | `DB_NAME` | `test` |
    | `RAZORPAY_KEY_ID` | *(Your Key)* |
    | `RAZORPAY_KEY_SECRET` | *(Your Secret)* |

6.  Click **Create Web Service**.

## Verification
- Wait 5 minutes for build.
- Open the URL.
- **Note**: The first load will take ~1 minute (Render Free Tier wakes up).
