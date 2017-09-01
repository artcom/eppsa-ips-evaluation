# Indoor Positioning Systems Evaluation Software

Tools for the evaluation of the quality / accuracy of indoor positioning systems

## Usage

Service can be configured in the following ways:
- using a ```.config.json``` file based on the ```.config.example.json``` file
- using environmental variables:
    - DATABASE
    - DATABASE_USER
    - DATABASE_PORT
    - DATABASE_HOST
    - DATABASE_PASSWORD
    - QUUPPA_SERVER

```bash
npm install
npm run start
```

## Tests

### Configuration

Tests will use a test database defined int a ```.config.json``` file when the database and Quuppa server environmental
variables are not set

### Run

Tests can be run using

```bash
npm run test
```

Or run on file changes with

```bash
npm run test-watch
```

Test coverage data can be generated with

```bash
npm run test-with-coverage
```

Coverage data can be displayed in a browser at ```coverage/index.html```

## RESTful service

The service exposes a RESTful API on port 3000. The API allows setting up experiments and running them. All POST
requests should contain the header ```Content-Type: application/json```

### Running an experiment

End point: ```/experiments/experiment-name/run```

Accepts POST requests.

After the experiment has been created and set up (define points, nodes and node positions, see **Experiment set up**)

The experiment can be run by sending a POST request to ```/experiments/experiment-name/run``` with:

```json
{
  "experimentTypes": ["experiment_type", ...],
  "repeats": "integer",
  "interval": "integer(milliseconds)"
}
```

The experiments of types ```experimentTypes``` will be run ```repeats``` times at an interval of ```interval```
milliseconds. Postion data will be collected for all nodes defined in nodePositions and stored in PositionData alongside
with position error metrics. Primary error metrics for the complete experiment will be stored in ExperimentMetrics.

The experiment can be re-run after changing the node positions and the data will be stored under the same experiment
name.

Supported experiment types:
- "Quuppa"

### Retrieving experimental data

#### Per point position data

End point: ```/experiments/experiment-name/position-data```

Accepts GET requests. Returns the position data for all point measures for the experiment ```experiment-name``` in the form:

```json
[
  {
    "pointName": "point_name",
    "experimentName": "experiment_name",
    "localizedNodeId": "node_id",
    "localizedNodeName": "node_name",
    "estCoordinateX": "float",
    "estCoordinateY": "float",
    "estCoordinateZ": "float",
    "estZoneLabel": "zone_label",
    "latency": "float",
    "powerConsumption": "float",
    "localizationError2d": "float",
    "localizationError3d": "float",
    "zoneAccuracy": "0 || 1"
  },
  ...
]
```

#### Experiment metrics

End point: ```/experiments/experiment-name/primary-metrics```

Accepts GET requests. Returns the primary error metrics for the experiment ```experiment-name``` in the form:

```json
{
  "experimentName": "experiment_name",
  "error2dAverage": "float",
  "error2dMin": "float",
  "error2dMax": "float",
  "error2dVariance": "float",
  "error2dMedian": "float",
  "error2dRMS": "float",
  "error2dPercentile75": "float",
  "error2dPercentile90": "float",
  "error3dAverage": "float",
  "error3dMin": "float",
  "error3dMax": "float",
  "error3dVariance": "float",
  "error3dMedian": "float",
  "error3dRMS": "float",
  "error3dPercentile75": "float",
  "error3dPercentile90": "float",
  "zoneAccuracyAverage": "float",
  "latencyAverage": "float",
  "latencyMin": "float",
  "latencyMax": "float",
  "latencyVariance": "float",
  "latencyMedian": "float",
  "latencyRMS": "float",
  "latencyPercentile75": "float",
  "latencyPercentile90": "float",
  "powerConsumptionAverage": "float",
  "powerConsumptionMin": "float",
  "powerConsumptionMax": "float",
  "powerConsumptionVariance": "float",
  "powerConsumptionMedian": "float",
  "powerConsumptionRMS": "float",
  "powerConsumptionPercentile75": "float",
  "powerConsumptionPercentile90": "float"
}
```

### Experiment set up

#### Create zones with known borders

End point: ```/zones```

Accepts GET and POST requests.

New zones can be created:

- using a POST request to ```/zones``` with:

```json
{
    "name": "zone_name",
    "xMin": "float",
    "xMax": "float",
    "yMin": "float",
    "yMax": "float",
    "zMin": "float",
    "zMax": "float"
}
```

- or in a batch using a POST request to ```/zones``` with:

```json
[
    {
        "name": "zone_name",
        "xMin": "float",
        "xMax": "float",
        "yMin": "float",
        "yMax": "float",
        "zMin": "float",
        "zMax": "float"
    },
    ...
]
```

#### Create points with known coordinates

End point: ```/points```

Accepts GET and POST requests.

New points can be created:

- using a POST request to ```/points``` with:

```json
{
    "name": "point_name",
    "trueCoordinateX": "float",
    "trueCoordinateY": "float",
    "trueCoordinateZ": "float"
}
```

- or in a batch using a POST request to ```/points``` with:

```json
[
    {
        "name": "point_name",
        "trueCoordinateX": "float",
        "trueCoordinateY": "float",
        "trueCoordinateZ": "float"
    },
    ...
]
```

On a GET request all points will be returned as:

```json
[
    {
        "name": "point_name",
        "trueCoordinateX": "float",
        "trueCoordinateY": "float",
        "trueCoordinateZ": "float",
        "trueZoneLabel": "zone_name"
    },
    ...
]
```

The ```trueZoneLabel``` will be computed from the zones.

#### Create nodes to be positioned

End point: ```/nodes```

Accepts GET and POST requests.

New nodes can be created:

- using a POST request to ```/nodes``` with:

```json
{
    "id": "node_id",
    "name": "node_name",
    "type": "node_type"
}
```

- or in a batch using a POST request to ```/nodes``` with:

```json
[
    {
        "id": "node_id",
        "name": "node_name",
        "type": "node_type"
    },
    ...
]
```

#### Create experiment

End point: ```/experiments```

Accepts GET and POST requests.

New experiment can be created:

- using a POST request to ```/experiments``` with:

```json
{
    "name": "experiment_name"
}
```

#### Define node positions

End point: ```/experiments/experiment-name/node-positions```

Accepts GET and POST requests.

Node positions can be defined or modified:

- using a POST request to ```/experiments/experiment-name/node-positions``` with:

```json
{
  "localizedNodeId": "node_id", "pointName": "point_name"
}
```

- or in a batch using a POST request to ```/experiments/experiment-name/node-positions``` with:

```json
[
    {
      "localizedNodeId": "node_id", "pointName": "point_name"
    },
    ...
]
```
 