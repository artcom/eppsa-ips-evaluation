import math


class Errors:
    """
    Error computation methods
    """
    def __init__(self, data_point):
        """
        Initializes class with data point
        :param data_point: DataPoint object
        """
        self.data_point = data_point

    def compute_localization_error_2d(self):
        """
        Computes 2D localization error of a point
        :return: computed 2D localization error
        """
        (true_x, true_y, est_x, est_y) = (
            self.data_point.true_coordinate_x,
            self.data_point.true_coordinate_y,
            self.data_point.est_coordinate_x,
            self.data_point.est_coordinate_y
        )
        return math.sqrt(math.pow((true_x - est_x), 2) + math.pow((true_y - est_y), 2))

    def compute_localization_error_3d(self):
        """
        Computes 3D localization error of a point
        :return: computed 3D localization error
        """
        (true_x, true_y, true_z, est_x, est_y, est_z) = (
            self.data_point.true_coordinate_x,
            self.data_point.true_coordinate_y,
            self.data_point.true_coordinate_z,
            self.data_point.est_coordinate_x,
            self.data_point.est_coordinate_y,
            self.data_point.est_coordinate_z
        )
        return math.sqrt(math.pow((true_x - est_x), 2) + math.pow((true_y - est_y), 2) + math.pow((true_z - est_z), 2))
