import Opa5 from "sap/ui/test/Opa5";
import AggregationLengthEquals from "sap/ui/test/matchers/AggregationLengthEquals";
import EnterText from "sap/ui/test/actions/EnterText";
import Press from "sap/ui/test/actions/Press";
var sListView = Opa5.getTestLibConfig("sampleLibrary").listViewName;
Opa5.createPageObjects({
    onTheListPage: {
        viewName: sListView,
        actions: {
            iSetTheFilter: function (sFilter) {
                return this.waitFor({
                    controlType: "sap.m.SearchField",
                    actions: new EnterText({ text: sFilter }),
                    errorMessage: "The SeachField was not found"
                });
            },
            iNavigateFromListItem: function (sColumnName, sItemName) {
                return this.waitFor({
                    controlType: "sap.m.ColumnListItem",
                    matchers: function (oColumnListItem) {
                        var bFound = false;
                        var oTableRow = oColumnListItem.getBindingContext("items").getObject();
                        Object.keys(oTableRow).forEach(function (sName) {
                            bFound = sName === sColumnName && oTableRow[sName] === sItemName;
                        });
                        return bFound;
                    },
                    actions: new Press(),
                    errorMessage: "There are no rows with " + sColumnName + " value " + sItemName
                });
            }
        },
        assertions: {
            theResultListIsVisible: function (iListLength) {
                return this.waitFor({
                    controlType: "sap.m.Table",
                    matchers: new AggregationLengthEquals({ name: "items", length: iListLength }),
                    success: function () {
                        Opa5.assert.ok(true, "The filtered list page item count is correct");
                    },
                    errorMessage: "The filtered list is not correct"
                });
            }
        }
    }
});