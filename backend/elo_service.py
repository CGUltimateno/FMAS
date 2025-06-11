import requests
import datetime
import csv
from io import StringIO

# === Team name manual mappings ===
TEAM_NAME_MAP = {
    "Paris Saint Germain": "Paris SG",
    "Manchester United": "Man United",
    "Internazionale": "Inter Milan",
    "Bayern Munich": "Bayern",
    "Juventus": "Juventus",
    "Arsenal": "Arsenal",
    "Real Madrid": "Real Madrid",
    "Barcelona": "Barcelona",
    "Manchester City": "Man City",
    # Add more as needed...
}

def fetch_daily_elo(date=None):
    """
    Fetch club Elo rankings for a given date (or today if None)
    Returns: dict { team_name: elo_value }
    """
    if date is None:
        date = datetime.date.today().strftime("%Y-%m-%d")

    url = f"https://api.clubelo.com/{date}"
    response = requests.get(url)
    if not response.ok:
        raise Exception(f"Failed to fetch Elo data: {response.status_code}")

    csv_data = csv.DictReader(StringIO(response.text))
    elo_map = {row["Club"]: int(float(row["Elo"])) for row in csv_data}
    return elo_map

def resolve_team_elo(api_team_name, elo_map):
    """
    Try to get Elo from name map or direct match
    """
    clubelo_name = TEAM_NAME_MAP.get(api_team_name, api_team_name)
    return elo_map.get(clubelo_name)
