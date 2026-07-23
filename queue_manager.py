from models import Batch


def add_batch(lane, time, count, emergency=False):
    if count <= 0:
        return
    lane.queue.append(Batch(time, count, emergency))


def remove_vehicles(lane, count):
    removed = 0

    while lane.queue and removed < count:
        batch = lane.queue[0]

        take = min(batch.count, count - removed)
        batch.count -= take
        removed += take

        if batch.count == 0:
            lane.queue.pop(0)

    return removed


def get_front_arrival_time(lane):
    if not lane.queue:
        return None
    return lane.queue[0].arrival_time