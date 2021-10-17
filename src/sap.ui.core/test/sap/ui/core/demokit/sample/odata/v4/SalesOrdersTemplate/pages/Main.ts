import Opa5 from "sap/ui/test/Opa5";
import Press from "sap/ui/test/actions/Press";
var sViewName = "sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Main";
Opa5.createPageObjects({
    onTheMainPage: {
        actions: {
            pressValueHelpOnCurrencyCode: function () {
                this.waitFor({
                    actions: new Press(),
                    controlType: "sap.m.Input",
                    id: /-0-field/,
                    success: function (oValueHelp) {
                        Opa5.assert.ok(true, "ValueHelp on CurrencyCode pressed");
                        this.waitFor({
                            controlType: "sap.m.Popover",
                            success: function (aControls) {
                                aControls[0].close();
                                Opa5.assert.ok(true, "ValueHelp Popover Closed");
                            }
                        });
                    },
                    viewName: sViewName
                });
            },
            pressValueHelpOnRole: function () {
                this.waitFor({
                    actions: new Press(),
                    controlType: "sap.m.ComboBox",
                    id: /-0-field/,
                    success: function (oValueHelp) {
                        Opa5.assert.ok(true, "ValueHelp on Role pressed");
                    },
                    viewName: sViewName
                });
            }
        }
    }
});