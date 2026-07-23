from simulator import simulate_arrivals
from scheduler import select_lane
from signal_controller import process_departure
from queue_manager import get_front_arrival_time


def update_wait_times(state):
    for lane in state.lanes:
        if lane.total_queue() == 0:
            lane.wait_time = 0
            continue

        arrival_time = get_front_arrival_time(lane)
        lane.wait_time = state.time - arrival_time


def decide(state):
    arrivals = simulate_arrivals(state)

    if all(l.total_queue() == 0 for l in state.lanes):
        state.current_lane = None
        return None, arrivals

    lane = select_lane(state.lanes)
    state.current_lane = lane.lane_id

    return lane, arrivals


def execute(state, lane):
    departures = 0

    if lane is not None:
        departures = process_departure(lane)

    update_wait_times(state)
    state.time += 5

    return departures