import createAndAppendDiv from "sap/ui/qunit/utils/createAndAppendDiv";
import SampleTester from "sap/ui/demo/mock/qunit/SampleTester";
createAndAppendDiv("content");
new SampleTester("sap.ui.core", [
    "sap.ui.core.sample.View.async",
    "sap.ui.core.sample.ViewTemplate.scenario",
    "sap.ui.core.sample.ViewTemplate.scenario.extension",
    "sap.ui.core.sample.ViewTemplate.tiny",
    "sap.ui.core.sample.ViewTemplate.types",
    "sap.ui.core.sample.odata.v4.ConsumeV2Service",
    "sap.ui.core.sample.odata.v4.ListBinding",
    "sap.ui.core.sample.odata.v4.SalesOrders",
    "sap.ui.core.sample.odata.v4.SalesOrdersTemplate",
    "sap.ui.core.sample.odata.v4.SalesOrderTP100_V2",
    "sap.ui.core.sample.odata.v4.SalesOrderTP100_V4",
    "sap.ui.core.sample.HyphenationAPI"
]).placeAt("content");