Backend setup:

cd backend
python -m venv .venv && source .venv/bin/activate
pip install Django djangorestframework django-cors-headers psycopg
python manage.py migrate
python manage.py runserver


Frontend setup:

cd frontend
npm ci
npm run dev
