# BLAKE Foundation — NGO Community Website

A professional, animated NGO community homepage with Volunteer, Membership, and Sponsor application forms that integrate with Lark Base (Feishu Bitable).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your Lark/Feishu credentials

# 3. Start the server
npm start

# 4. Open in browser
open http://localhost:3000
```

## Lark Base Setup

### Step 1: Create a Lark/Feishu App

1. Go to [Feishu Open Platform](https://open.feishu.cn/app) or [Lark Developer](https://open.larksuite.com/app)
2. Create a new custom app
3. Copy the **App ID** and **App Secret** into your `.env` file
4. Under **Permissions**, add: `bitable:app:access` (Read and write Bitable)
5. Publish the app version and approve it in the admin console

### Step 2: Create a Lark Base

1. Create a new Lark Base (Bitable) document
2. Copy the **app_token** from the URL (e.g. `https://xxx.feishu.cn/base/XXXXX`) into `.env`

### Step 3: Create Tables

Create **3 tables** with these exact column names:

**Volunteers Table:**
| Column Name   | Field Type |
|---------------|------------|
| Name          | Text       |
| Email         | Text       |
| Phone         | Text       |
| Location      | Text       |
| Skills        | Text       |
| Availability  | Text       |
| Motivation    | Text       |
| Submitted At  | Text       |

**Membership Table:**
| Column Name      | Field Type |
|------------------|------------|
| Name             | Text       |
| Email            | Text       |
| Phone            | Text       |
| Organization     | Text       |
| Membership Type  | Text       |
| Interests        | Text       |
| Message          | Text       |
| Submitted At     | Text       |

**Sponsors Table:**
| Column Name         | Field Type |
|---------------------|------------|
| Name                | Text       |
| Email               | Text       |
| Phone               | Text       |
| Company             | Text       |
| Sponsorship Level   | Text       |
| Focus Area          | Text       |
| Message             | Text       |
| Submitted At        | Text       |

4. Copy each table's **table_id** into `.env`

> **Tip:** You can find the table_id by clicking on a table and checking the URL, or by using the Lark API to list tables.

### Step 4: Grant Permissions

Make sure your Lark app has permission to access the Lark Base document. You can do this by adding the app as a collaborator on the Base document.

## Features

- Stunning dark-themed UI with gradient animations
- Particle background effects
- Scroll-triggered reveal animations
- Animated number counters
- 3D card tilt effects
- Three application forms: Volunteer, Membership, Sponsor
- Form data automatically synced to Lark Base
- Fully responsive for mobile devices
- Graceful fallback (logs to console if Lark is not configured)

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **Database:** Lark Base (Feishu Bitable)
