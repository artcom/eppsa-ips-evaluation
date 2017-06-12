from computations.errors import Errors


class ProcessData:
    """
    Computes quality metrics
    """
    def __init__(self, experiment):
        self.experiment = experiment
        self.localization_error_2d = {
            data.point_id: Errors(data).compute_localization_error_2d() for data in self.experiment.locations
        }
        self.localization_error_3d = {
            data.point_id: Errors(data).compute_localization_error_3d() for data in self.experiment.locations
        }
        self.correct_rooms = {
            data.point_id: data.true_room_label == data.est_room_label for data in self.experiment.locations
        }
