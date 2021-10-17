import Helper from "sap/ui/core/sample/common/Helper";
import Opa5 from "sap/ui/test/Opa5";
import EnterText from "sap/ui/test/actions/EnterText";
import Press from "sap/ui/test/actions/Press";
import Properties from "sap/ui/test/matchers/Properties";
var sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main";
Opa5.createPageObjects({
    onAdaptUIDialog: {
        actions: {
            changeNote: function (sNewNoteValue) {
                Helper.changeInputValue(this, sViewName, "Note::new", sNewNoteValue);
            },
            applyDialog: function () {
                Helper.pressButton(this, sViewName, "ApplyChangesInFragment");
            },
            checkCheckBox: function (sCheckBoxText) {
                this.waitFor({
                    actions: new Press(),
                    controlType: "sap.m.CheckBox",
                    matchers: new Properties({ text: sCheckBoxText }),
                    viewName: sViewName
                });
            }
        },
        assertions: {
            checkCheckBoxIsSelected: function (sCheckBoxText, bSelected) {
                this.waitFor({
                    controlType: "sap.m.CheckBox",
                    matchers: new Properties({ text: sCheckBoxText }),
                    success: function (oCheckBox) {
                        var bIsSelected = oCheckBox[0].mProperties.selected;
                        Opa5.assert.ok(bIsSelected === bSelected, "CheckBox: " + sCheckBoxText + (bSelected ? " is selected" : " is not selected"));
                    },
                    viewName: sViewName
                });
            }
        }
    },
    onTheMainPageRTA: {
        actions: {
            pressAdaptUIButton: function (sButtonId) {
                Helper.pressButton(this, sViewName, sButtonId);
            }
        },
        assertions: {
            checkNewPropertyAppears: function (sPropertyId) {
                this.waitFor({
                    controlType: "sap.m.Text",
                    id: sPropertyId,
                    viewName: sViewName
                });
            },
            checkNewColumnAppears: function (sTableId, sExpectedText, iExpectedLength) {
                this.waitFor({
                    controlType: "sap.m.Table",
                    id: sTableId,
                    check: function (oSalesOrderTable) {
                        return oSalesOrderTable.getItems().length > 0;
                    },
                    success: function (oControl) {
                        var iColumnLength = oControl.getItems()[0].getCells().length, sText = oControl.getItems()[0].getCells()[iColumnLength - 1].getText();
                        Opa5.assert.ok(iColumnLength === iExpectedLength, "Column Length is: " + iColumnLength);
                        Opa5.assert.ok(sText === sExpectedText, "Cell Text is: " + sText);
                    },
                    viewName: sViewName
                });
            }
        }
    }
});