from queue_manager import remove_vehicles


def process_departure(lane):
    removed = remove_vehicles(lane, 25)
    update_emergency(lane, removed)
    return removed


def update_emergency(lane, removed_count):
    remaining = removed_count

    for batch in lane.queue:
        if not batch.emergency:
            continue

        if remaining >= batch.count:
            remaining -= batch.count
            batch.emergency = False
        else:
            batch.emergency = False
            break