class DataPoint:
    """
    Data point object with measured and estimated coordinates and room localization and optional latency and power
    consumption values
    """
    def __init__(
            self,
            point_id=None,
            localized_node_id=None,
            true_coordinate_x=None,
            true_coordinate_y=None,
            true_coordinate_z=None,
            true_room_label=None,
            est_coordinate_x=None,
            est_coordinate_y=None,
            est_coordinate_z=None,
            est_room_label=None,
            latency=-1,
            power_consumption=-1,
    ):
        """
        Sets parameters
        :param point_id: id of geometric point
        :param localized_node_id: id of localized device
        :param true_coordinate_x: measured coordinate x
        :param true_coordinate_y: measured coordinate y
        :param true_coordinate_z: measured coordinate z
        :param true_room_label: actual room location
        :param est_coordinate_x: estimated coordinate x
        :param est_coordinate_y: estimated coordinate y
        :param est_coordinate_z: estimated coordinate z
        :param est_room_label: estimated room id
        :param latency: positioning latency (optional)
        :param power_consumption: power consumption for positioning (optional)
        """
        self.point_id = point_id
        self.localized_node_id = localized_node_id
        self. true_coordinate_x = true_coordinate_x
        self.true_coordinate_y = true_coordinate_y
        self.true_coordinate_z = true_coordinate_z
        self.true_room_label = true_room_label
        self.est_coordinate_x = est_coordinate_x
        self.est_coordinate_y = est_coordinate_y
        self.est_coordinate_z = est_coordinate_z
        self.est_room_label = est_room_label
        self.latency = latency
        self.power_consumption = power_consumption
