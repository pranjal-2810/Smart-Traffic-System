MAX_WAIT = 60
MAX_QUEUE = 50


def resolve_emergency(lanes):
    emergency_lanes = [l for l in lanes if l.has_emergency()]
    return max(emergency_lanes, key=lambda l: (l.wait_time, l.total_queue()))


def check_forced(lanes):
    forced = [l for l in lanes if l.wait_time > MAX_WAIT or l.total_queue() > MAX_QUEUE]
    if not forced:
        return None
    return max(forced, key=lambda l: l.wait_time)


def compute_priority(lane, total_q, total_w):
    q_norm = (lane.total_queue() / total_q) if total_q > 0 else 0
    w_norm = (lane.wait_time / total_w) if total_w > 0 else 0
    return 0.6 * q_norm + 0.4 * w_norm


def select_lane(lanes):
    if any(l.has_emergency() for l in lanes):
        return resolve_emergency(lanes)

    forced_lane = check_forced(lanes)
    if forced_lane:
        return forced_lane

    total_q = sum(l.total_queue() for l in lanes)
    total_w = sum(l.wait_time for l in lanes)

    return max(lanes, key=lambda l: compute_priority(l, total_q, total_w))