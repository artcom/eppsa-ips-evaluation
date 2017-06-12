import math
from unittest import TestCase
from datapoint import DataPoint
from experiment import Experiment
from processdata import ProcessData
from computations.errors import Errors


class TestProcessData(TestCase):
    def setUp(self):
        self.experiment = Experiment()
        self.location_data = [
            {
                'point_id': 1,
                'localized_node_id': 1,
                'true_coordinate_x': 1,
                'true_coordinate_y': 1,
                'true_coordinate_z': 1,
                'true_room_label': 'Room_1',
                'est_coordinate_x': 1.1,
                'est_coordinate_y': 1.01,
                'est_coordinate_z': 1.9,
                'est_room_label': 'Room_1_1',
                'latency': 12.10,
                'power_consumption': 2.12,
            },
            {
                'point_id': 2,
                'localized_node_id': 2,
                'true_coordinate_x': 2,
                'true_coordinate_y': 2,
                'true_coordinate_z': 2,
                'true_room_label': 'Room_2',
                'est_coordinate_x': 2.1,
                'est_coordinate_y': 2.2,
                'est_coordinate_z': 2.9,
                'est_room_label': 'Room_2',
                'latency': 11.15,
                'power_consumption': 1.87,
            },
            {
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
        ]
        for data_point in self.location_data:
            self.experiment.add_data_point(**data_point)
        self.process_data = ProcessData(self.experiment)

    def test_process_data_computes_localization_error_2D(self):
        expected_localization_error_2d = {
                data['point_id']: self.compute_localization_error_2D(
                    data
                ) for data in self.location_data
            }
        self.assertEqual(
            expected_localization_error_2d,
            self.process_data.localization_error_2D,
            'expected: %s, got: %s' % (
                expected_localization_error_2d,
                self.process_data.localization_error_2D
            )
        )

    def compute_localization_error_2D(self, data):
        data_point = DataPoint(**data)
        return Errors(data_point).compute_localization_error_2d()
