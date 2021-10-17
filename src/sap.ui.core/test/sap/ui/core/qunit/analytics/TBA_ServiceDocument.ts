import o4aFakeService from "sap/ui/core/qunit/analytics/o4aFakeService";
o4aFakeService.addResponse({
    uri: "",
    header: o4aFakeService.headers.JSON,
    content: "{ \"d\": { \"EntitySets\": [\"ActualPlannedCostsResults\", \"ActualPlannedCosts\", \"ControllingAreas\", \"CostCenterResults\", \"CostCentersTemporalView\", \"CostCenters\", \"CostElements\"] } }"
});