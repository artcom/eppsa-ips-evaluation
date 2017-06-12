from unittest import TestCase
from experiment import Experiment


class TestExperimentLocations(TestCase):
    def setUp(self):
        self.experiment = Experiment()
        self.location1_data = {
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
        }
        self.location2_data = {
            'point_id': 1,
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
        }
        self.location3_data = {
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
        for data_point in [self.location1_data, self.location2_data, self.location3_data]:
            self.experiment.add_data_point(**data_point)

    def test_experiment_add_location(self):
        self.assertTrue(
            len(self.experiment.locations) == 3,
            '%s data points were added, expected %s' % (len(self.experiment.locations), 3)
        )
