from datapoint import DataPoint


class Experiment:
    """
    Stores data points
    """
    def __init__(self):
        self.locations = []

    def add_data_point(self, **kwargs):
        """
        Adds a data point to class
        :param kwargs: data point parameters
        :return: nothing
        """
        location = DataPoint(**kwargs)
        self.locations.append(location)
