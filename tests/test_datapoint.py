from unittest import TestCase
from datapoint import DataPoint


class TestDataPoint(TestCase):
    def setUp(self):
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
        self.default_data = {
            'point_id': None,
            'localized_node_id': None,
            'true_coordinate_x': None,
            'true_coordinate_y': None,
            'true_coordinate_z': None,
            'true_room_label': None,
            'est_coordinate_x': None,
            'est_coordinate_y': None,
            'est_coordinate_z': None,
            'est_room_label': None,
            'latency': -1,
            'power_consumption': -1,
        }
        self.location1 = DataPoint(**self.location1_data)
        self.default_location = DataPoint()

    def test_point_has_been_added_with_expected_data(self):
        self.assertEqual(self.location1_data['point_id'], self.location1.point_id)
        self.assertEqual(self.location1_data['localized_node_id'], self.location1.localized_node_id)
        self.assertEqual(self.location1_data['true_coordinate_x'], self.location1.true_coordinate_x)
        self.assertEqual(self.location1_data['true_coordinate_y'], self.location1.true_coordinate_y)
        self.assertEqual(self.location1_data['true_coordinate_z'], self.location1.true_coordinate_z)
        self.assertEqual(self.location1_data['true_room_label'], self.location1.true_room_label)
        self.assertEqual(self.location1_data['est_coordinate_x'], self.location1.est_coordinate_x)
        self.assertEqual(self.location1_data['est_coordinate_y'], self.location1.est_coordinate_y)
        self.assertEqual(self.location1_data['est_coordinate_z'], self.location1.est_coordinate_z)
        self.assertEqual(self.location1_data['latency'], self.location1.latency)
        self.assertEqual(self.location1_data['power_consumption'], self.location1.power_consumption)

    def test_default_data_point(self):
        self.assertEqual(self.default_data['point_id'], self.default_location.point_id)
        self.assertEqual(self.default_data['localized_node_id'], self.default_location.localized_node_id)
        self.assertEqual(self.default_data['true_coordinate_x'], self.default_location.true_coordinate_x)
        self.assertEqual(self.default_data['true_coordinate_y'], self.default_location.true_coordinate_y)
        self.assertEqual(self.default_data['true_coordinate_z'], self.default_location.true_coordinate_z)
        self.assertEqual(self.default_data['true_room_label'], self.default_location.true_room_label)
        self.assertEqual(self.default_data['est_coordinate_x'], self.default_location.est_coordinate_x)
        self.assertEqual(self.default_data['est_coordinate_y'], self.default_location.est_coordinate_y)
        self.assertEqual(self.default_data['est_coordinate_z'], self.default_location.est_coordinate_z)
        self.assertEqual(self.default_data['latency'], self.default_location.latency)
        self.assertEqual(self.default_data['power_consumption'], self.default_location.power_consumption)
