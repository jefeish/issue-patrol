# Issue-Patrol

Observe and inspect Repository issues.

This App visualizes Issues, their age and activity, based on last update.

The goal is to get a quick overview on the status of Repo Issues.

![overview](docs/images/issue_patrol.png)

Explanation:
- Each `Bar` indicates the overall length that the Issue has been open
- The darker color on the `Bar` shows the last update on the Issue, letting you know about the contributions or activity
- So if you see an Issue that only shows a light color, this means after creating the Issue, nobody provdided any update = no Activity.

---

## Run the App

1. Create an `.env` file
   1. Copy the `.env.sample` file to `.env`, provide a GitHub PAT for the `TOKEN`

   Sample `.env` content

   ```bash
   API_URL=api.github.com
   ORG="jefeish"
   PORT=8008
   TOKEN="ghp_..."
   ```

2. Start the App

    ```bash
    npm start
    ```
