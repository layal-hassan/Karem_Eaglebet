# EAGLEBET

The project now consists of a Vue frontend and a Django REST backend.

## Run locally

Open two PowerShell terminals from this directory.

Backend:

```powershell
cd backend
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Frontend:

```powershell
cd frontend
npm run dev
```

Then open `http://localhost:5173`.

## Initial administrator

The local database is initialized with the administrator requested for this project. To reset its password without storing a plain-text password in source code:

```powershell
cd backend
python manage.py setup_initial_user --username YOUR_USERNAME --password "YOUR_PASSWORD"
```

For production, set `EAGLEBET_SECRET_KEY`, set `EAGLEBET_DEBUG=false`, configure the production host/CORS values, use HTTPS, and move from SQLite to the production database.
