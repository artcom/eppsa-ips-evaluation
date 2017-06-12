import math
from unittest import TestCase
from datapoint import DataPoint
from computations.errors import Errors


class TestErrors(TestCase):
    def setUp(self):
        self.data_point = DataPoint(
            **{
                'point_id': 3,
                'localized_node_id': 3,
                'true_coordinate_x': 3,
                'true_coordinate_y': 3,
                'true_coordinate_z': 3,
                'true_room_label': 'Room_3',
                'est_coordinate_x': 3.3,
                'est_coordinate_y': 4.2,
                'est_coordinate_z': 1.9,
                'est_room_label': 'Room_3',
                'latency': 15.15,
                'power_consumption': 1.99,
            }
        )
        self.errors = Errors(self.data_point)

    def test_compute_localization_error_2d(self):
        expected_error = math.sqrt(math.pow((3 - 3.3), 2) + math.pow((3 - 4.2), 2))
        self.assertEqual(
            expected_error,
            self.errors.compute_localization_error_2d()
        )
