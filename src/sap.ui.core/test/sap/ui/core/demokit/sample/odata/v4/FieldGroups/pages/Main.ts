import Opa5 from "sap/ui/test/Opa5";
import EnterText from "sap/ui/test/actions/EnterText";
import Press from "sap/ui/test/actions/Press";
import TestUtils from "sap/ui/test/TestUtils";
var sViewName = "sap.ui.core.sample.odata.v4.FieldGroups.FieldGroups";
Opa5.createPageObjects({
    onTheMainPage: {
        actions: {
            enterValue: function (sId, sValue) {
                this.waitFor({
                    actions: new EnterText({ text: sValue, keepFocus: true }),
                    controlType: "sap.m.Input",
                    id: sId,
                    viewName: sViewName
                });
            },
            resetRequestCount: function () {
                this.waitFor({
                    success: function () {
                        TestUtils.resetRequestCount();
                    },
                    viewName: sViewName
                });
            },
            selectField: function (sId) {
                this.waitFor({
                    actions: new Press(),
                    controlType: "sap.m.Input",
                    id: sId,
                    viewName: sViewName
                });
            }
        },
        assertions: {
            checkField: function (sId, sExpectedValue) {
                this.waitFor({
                    controlType: "sap.m.Input",
                    id: sId,
                    success: function (oInput) {
                        Opa5.assert.strictEqual(oInput.getValue(), sExpectedValue, sId + "=" + sExpectedValue);
                    },
                    viewName: sViewName
                });
            },
            checkRequestCount: function (iRequestCount) {
                this.waitFor({
                    success: function () {
                        Opa5.assert.strictEqual(TestUtils.getRequestCount(), iRequestCount, iRequestCount + " requests");
                    },
                    viewName: sViewName
                });
            }
        }
    }
});