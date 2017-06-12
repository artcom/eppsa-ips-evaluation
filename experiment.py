from datapoint import DataPoint


class Experiment:
    def __init__(self):
        self.locations = []

    def add_data_point(self, **kwargs):
        location = DataPoint(**kwargs)
        self.locations.append(location)
