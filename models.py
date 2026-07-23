class Batch:
    def __init__(self, arrival_time, count, emergency=False):
        self.arrival_time = arrival_time
        self.count = count
        self.emergency = emergency


class Lane:
    def __init__(self, lane_id):
        self.lane_id = lane_id
        self.queue = []
        self.wait_time = 0

    def total_queue(self):
        return sum(batch.count for batch in self.queue)

    def has_emergency(self):
        return any(batch.emergency for batch in self.queue)


class SystemState:
    def __init__(self):
        self.lanes = [Lane(i) for i in range(4)]
        self.time = 0
        self.current_lane = None