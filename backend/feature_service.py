import requests
from datetime import datetime, timedelta
from fastapi import FastAPI, Request
import uvicorn
import joblib
import os
from dotenv import load_dotenv


load_dotenv()  # loads variables from .env

API_KEY = os.getenv("FOOTBALL_DATA_API_KEY")
BASE_URL = os.getenv("API_FD_BASE_URL")
HEADERS = {"x-apisports-key": API_KEY}

app = FastAPI()
def fetch_matches(team_id, to_date, venue, limit=5):
    if "T" in to_date:
        to_date = to_date.split("T")[0]
    to_date_obj = datetime.strptime(to_date, "%Y-%m-%d")
    from_date = (to_date_obj - timedelta(days=365)).strftime("%Y-%m-%d")
    
    params = {
        "team": team_id,
        "to": to_date,
        "from": from_date,
        "status": "FT",
        "venue": venue,
        "limit": 20,
        "order": "desc"
    }
    response = requests.get(f"{BASE_URL}/fixtures", headers=HEADERS, params=params)
    data = response.json()
    return data['response'][:limit] if 'response' in data else []
def fetch_odds(fixture_id):
    params = {
        "fixture": fixture_id,
        "bookmaker": 8  # = bet365
    }
    response = requests.get(f"{BASE_URL}/odds", headers=HEADERS, params=params)
    data = response.json()
    try:
        odds = data['response'][0]['bookmakers'][0]['bets'][0]['values']
        return {
            "OddHome": float(next(o['odd'] for o in odds if o['value'] == 'Home')),
            "OddDraw": float(next(o['odd'] for o in odds if o['value'] == 'Draw')),
            "OddAway": float(next(o['odd'] for o in odds if o['value'] == 'Away'))
        }
    except Exception:
        return {"OddHome": 2.0, "OddDraw": 3.2, "OddAway": 3.5}  # fallback

def calculate_implied_probabilities(odds):
    prob_home = 1 / odds['OddHome']
    prob_draw = 1 / odds['OddDraw']
    prob_away = 1 / odds['OddAway']
    total = prob_home + prob_draw + prob_away
    return {
        'ImpliedProbHome': prob_home,
        'ImpliedProbDraw': prob_draw,
        'ImpliedProbAway': prob_away,
        'ImpliedProbTotal': total,
        'BookmakerMargin': total - 1.0
    }

def summarize_venue_matches(matches, team_id):
    points, gf, ga = [], [], []
    streaks = {"W": 0, "L": 0, "S": 0}

    for match in matches:
        is_home = match["teams"]["home"]["id"] == team_id
        goals_for = match["goals"]["home"] if is_home else match["goals"]["away"]
        goals_against = match["goals"]["away"] if is_home else match["goals"]["home"]

        if goals_for > goals_against:
            points.append(3)
            streaks["W"] += 1
            streaks["L"] = 0
        elif goals_for < goals_against:
            points.append(0)
            streaks["L"] += 1
            streaks["W"] = 0
        else:
            points.append(1)
            streaks["W"] = streaks["L"] = 0

        if goals_for > 0:
            streaks["S"] += 1
        else:
            streaks["S"] = 0

        gf.append(goals_for)
        ga.append(goals_against)

    return {
        "form3": sum(points[:3]),
        "form5": sum(points[:5]),
        "gf3": sum(gf[:3]),
        "gf5": sum(gf[:5]),
        "ga3": sum(ga[:3]),
        "ga5": sum(ga[:5]),
        "W": streaks["W"],
        "L": streaks["L"],
        "S": streaks["S"]
    }

def bin_streak(value):
    bins = [-1, 0, 2, 4, 6, 100]
    labels = [0, 1, 2, 3, 4]
    for i in range(len(bins) - 1):
        if bins[i] < value <= bins[i + 1]:
            return labels[i]
    return 0



division_medians = joblib.load('Models_config/division_medians.pkl')

def build_features(home_team_id, away_team_id, fixture_date, fixture_id=123456, division="F1"):
    home_matches = fetch_matches(home_team_id, fixture_date, venue="home")
    away_matches = fetch_matches(away_team_id, fixture_date, venue="away")

    home_stats = summarize_venue_matches(home_matches, home_team_id)
    away_stats = summarize_venue_matches(away_matches, away_team_id)

    # === Fetch and Impute Odds ===
    try:
        odds = fetch_odds(fixture_id)
    except:
        odds = {}

    if division in division_medians['Odds']:
        div_odds = division_medians['Odds'][division]
        odds['OddHome'] = float(odds.get('OddHome', div_odds['OddHome']))
        odds['OddDraw'] = float(odds.get('OddDraw', div_odds['OddDraw']))
        odds['OddAway'] = float(odds.get('OddAway', div_odds['OddAway']))
    else:
        odds['OddHome'] = float(odds.get('OddHome', 2.0))
        odds['OddDraw'] = float(odds.get('OddDraw', 3.1))
        odds['OddAway'] = float(odds.get('OddAway', 3.5))

    implied = calculate_implied_probabilities(odds)

    # === Elo Imputation ===
    if division in division_medians['Elo']:
        home_elo = division_medians['Elo'][division]['HomeElo']
        away_elo = division_medians['Elo'][division]['AwayElo']
    else:
        home_elo = 1500
        away_elo = 1500

    # === Final Feature Vector ===
    features = {
        "Division": division,
        "HomeElo": home_elo,
        "AwayElo": away_elo,
        **odds,
        **implied,

        "Form3Home_calc": home_stats["form3"],
        "Form5Home_calc": home_stats["form5"],
        "GF3Home": home_stats["gf3"],
        "GF5Home": home_stats["gf5"],
        "GA3Home": home_stats["ga3"],
        "GA5Home": home_stats["ga5"],

        "Form3Away_calc": away_stats["form3"],
        "Form5Away_calc": away_stats["form5"],
        "GF3Away": away_stats["gf3"],
        "GF5Away": away_stats["gf5"],
        "GA3Away": away_stats["ga3"],
        "GA5Away": away_stats["ga5"],

        "WStreakHome_bin": bin_streak(home_stats["W"]),
        "LStreakHome_bin": bin_streak(home_stats["L"]),
        "SStreakHome_bin": bin_streak(home_stats["S"]),

        "WStreakAway_bin": bin_streak(away_stats["W"]),
        "LStreakAway_bin": bin_streak(away_stats["L"]),
        "SStreakAway_bin": bin_streak(away_stats["S"]),

        "WinStreakGap": bin_streak(home_stats["W"]) - bin_streak(away_stats["W"]),
        "LossStreakGap": bin_streak(away_stats["L"]) - bin_streak(home_stats["L"]),
        "ScoreStreakGap": bin_streak(home_stats["S"]) - bin_streak(away_stats["S"]),

        "EloDiff": home_elo - away_elo,
        "EloTotal": home_elo + away_elo,
        "EloAdvantage": (home_elo - away_elo) / (home_elo + away_elo + 1e-6)
    }

    return features


@app.post("/generate_features")
async def generate_features(request: Request):
    payload = await request.json()
    features = build_features(
        home_team_id=payload["home_team_id"],
        away_team_id=payload["away_team_id"],
        fixture_date=payload["fixture_date"],
        fixture_id=payload.get("fixture_id", 123456)
    )
    return features

if __name__ == "__main__":
    uvicorn.run("feature_service:app", host="0.0.0.0", port=8000, reload=True)
