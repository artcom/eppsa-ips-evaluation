from computations.errors import Errors


class ProcessData:
    def __init__(self, experiment):
        self.experiment = experiment
        self.localization_error_2D = {
                data.point_id: Errors(data).compute_localization_error_2d() for data in self.experiment.locations
            }
