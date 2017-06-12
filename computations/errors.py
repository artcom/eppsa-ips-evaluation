import math


class Errors:
    def __init__(self, data_point):
        self.data_point = data_point

    def compute_localization_error_2d(self):
        (true_x, true_y, est_x, est_y) = (
            self.data_point.true_coordinate_x,
            self.data_point.true_coordinate_y,
            self.data_point.est_coordinate_x,
            self.data_point.est_coordinate_y
        )
        return math.sqrt(math.pow((true_x - est_x), 2) + math.pow((true_y - est_y), 2))
