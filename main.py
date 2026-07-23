from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import SystemState
from state_manager import decide, execute
from analytics import Analytics

app = FastAPI()
state = SystemState()
analytics = Analytics()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize_state(state):
    return {
        "time": state.time,
        "current_lane": state.current_lane,
        "lanes": [
            {
                "id": lane.lane_id,
                "queue": lane.total_queue(),
                "wait_time": lane.wait_time,
                "emergency": lane.has_emergency()
            }
            for lane in state.lanes
        ]
    }


@app.get("/state")
def get_state():
    lane, arrivals = decide(state)
    response = serialize_state(state)

    departures = execute(state, lane)
    analytics.log(state, arrivals, departures)

    return response


@app.get("/analytics")
def get_analytics():
    return analytics.get_metrics()