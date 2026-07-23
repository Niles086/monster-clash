# Monster Clash: Evolution — v1

A mobile-first Expo React Native game client with a FastAPI backend designed for Azure.

## Included in v1

- Expo Router navigation
- Email/password registration and login
- Secure token storage on iOS/Android
- Original card catalog
- Eight-card starter deck
- Four-card rotating hand
- Regenerating energy
- Touch-to-deploy lane battle
- Player and enemy towers
- Basic enemy AI
- Three-minute match timer
- Win/loss result
- FastAPI REST API
- SQLModel persistence
- SQLite locally and PostgreSQL in Azure
- Docker support for Azure Container Apps

## Project layout

```text
monster-clash-v1/
├── mobile/       Expo React Native application
└── backend/      FastAPI API
```

# 1. Install the software

Install:

1. Visual Studio Code
2. Node.js LTS
3. Python 3.12+
4. Git
5. Expo Go on your phone
6. Docker Desktop later, when deploying to Azure

Recommended VS Code extensions:

- Python
- Pylance
- ESLint
- Prettier
- Docker
- Azure Resources
- Azure Container Apps

# 2. Open the project

Extract this ZIP, then in VS Code choose:

`File > Open Folder > monster-clash-v1`

Open two VS Code terminals.

# 3. Start the backend

In terminal 1:

## Windows PowerShell

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open `http://127.0.0.1:8000/docs`.

# 4. Find your computer's local IP address

On Windows:

```powershell
ipconfig
```

Find the IPv4 address for the Wi-Fi adapter, such as `192.168.1.25`.

Your phone and computer must be connected to the same Wi-Fi network.

# 5. Configure the mobile app

In terminal 2:

```powershell
cd mobile
Copy-Item .env.example .env
npm install
```

Open `mobile/.env` and replace the example address:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.25:8000
```

Do not use `localhost` when testing on a physical phone. On the phone, `localhost` means the phone itself.

# 6. Start Expo

```powershell
npx expo start
```

Scan the QR code using Expo Go.

During Expo SDK transition periods, Expo Go may require a specific SDK. This starter is intentionally dependency-light. If Expo reports a version mismatch, run:

```powershell
npx expo install --fix
```

# 7. Test the app

1. Register a new account.
2. Open the Deck tab.
3. Confirm the starter deck contains eight cards.
4. Open Battle.
5. Tap a card.
6. Tap the left or right half of the lower battlefield.
7. Units automatically move and attack.
8. The enemy AI deploys its own units.
9. Destroy the enemy crystal or have more tower health when time expires.

# 8. Run the backend tests

```powershell
cd backend
pytest
```

# 9. Local database

The backend uses SQLite locally:

```env
DATABASE_URL=sqlite:///./monster_clash.db
```

Azure should use PostgreSQL:

```env
DATABASE_URL=postgresql+psycopg://USERNAME:PASSWORD@SERVER.postgres.database.azure.com:5432/monsterclash?sslmode=require
```

# 10. Deploy the backend to Azure Container Apps

Install and sign in to the Azure CLI:

```powershell
az login
az extension add --name containerapp --upgrade
```

Create variables:

```powershell
$RG="monster-clash-rg"
$LOCATION="westus2"
$ENVIRONMENT="monster-clash-env"
$APP="monster-clash-api"
$ACR="monsterclashregistry123"
```

Create resources:

```powershell
az group create --name $RG --location $LOCATION
az acr create --resource-group $RG --name $ACR --sku Basic --admin-enabled true
az acr build --registry $ACR --image monster-clash-api:v1 ./backend
az containerapp env create --name $ENVIRONMENT --resource-group $RG --location $LOCATION
```

Deploy:

```powershell
az containerapp create `
  --name $APP `
  --resource-group $RG `
  --environment $ENVIRONMENT `
  --image "$ACR.azurecr.io/monster-clash-api:v1" `
  --target-port 8000 `
  --ingress external `
  --registry-server "$ACR.azurecr.io" `
  --env-vars JWT_SECRET="CHANGE-THIS-TO-A-LONG-RANDOM-VALUE" DATABASE_URL="YOUR-AZURE-POSTGRESQL-CONNECTION-STRING"
```

Get the public API hostname:

```powershell
az containerapp show --name $APP --resource-group $RG --query properties.configuration.ingress.fqdn -o tsv
```

Change `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=https://YOUR-CONTAINER-APP-HOSTNAME
```

Restart Expo after changing environment variables.

# 11. Create Android and iOS builds

Install EAS CLI:

```powershell
npm install -g eas-cli
cd mobile
eas login
eas build:configure
```

Android test build:

```powershell
eas build --platform android --profile preview
```

iOS test build:

```powershell
eas build --platform ios --profile preview
```

Apple builds require an Apple Developer account. Google Play distribution requires a Google Play developer account.

# Important v1 limitations

- Battles run locally on the phone.
- The backend stores users and serves card definitions.
- The client currently decides match outcomes, so v1 is not cheat-resistant.
- Competitive multiplayer must use an authoritative server.
- Art is placeholder UI rather than final animation or illustrations.
- Social login, purchases, guilds, chat and ranked seasons are not included yet.

## Recommended v2

The next milestone should move battle simulation to an authoritative WebSocket server and add reconnectable PvP matchmaking.
