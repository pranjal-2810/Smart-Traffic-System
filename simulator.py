import random
from queue_manager import add_batch


def generate_arrivals():
    return random.randint(0, 10)


def simulate_arrivals(state):
    total_arrivals = 0

    for lane in state.lanes:
        arrivals = generate_arrivals()
        total_arrivals += arrivals

        emergency = False
        if arrivals > 0 and random.random() < 0.05:
            emergency = True

        add_batch(lane, state.time, arrivals, emergency)

    return total_arrivals