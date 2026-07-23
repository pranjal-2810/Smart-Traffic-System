import pandas as pd


class Analytics:
    def __init__(self):
        self.records = []

    def log(self, state, arrivals, departures):
        record = {
            "time": state.time,
            "lane_0_q": state.lanes[0].total_queue(),
            "lane_1_q": state.lanes[1].total_queue(),
            "lane_2_q": state.lanes[2].total_queue(),
            "lane_3_q": state.lanes[3].total_queue(),
            "avg_wait": sum(l.wait_time for l in state.lanes) / 4,
            "selected_lane": state.current_lane,
            "arrivals": arrivals,
            "departures": departures
        }
        self.records.append(record)

    def get_dataframe(self):
        return pd.DataFrame(self.records)

    def get_metrics(self):
        df = self.get_dataframe()

        if df.empty:
            return {}

        return {
            "time": df["time"].tolist(),
            "queues": {
                "lane0": df["lane_0_q"].tolist(),
                "lane1": df["lane_1_q"].tolist(),
                "lane2": df["lane_2_q"].tolist(),
                "lane3": df["lane_3_q"].tolist(),
            },
            "avg_wait": df["avg_wait"].tolist(),
            "signal_freq": df["selected_lane"].value_counts().to_dict(),
            "cum_arrival": df["arrivals"].cumsum().tolist(),
            "cum_departure": df["departures"].cumsum().tolist()
        }