import Helper from "sap/ui/core/sample/common/Helper";
import Opa5 from "sap/ui/test/Opa5";
var sViewName = "sap.ui.core.sample.odata.v4.SalesOrderTP100_V4.Main";
Opa5.createPageObjects({
    onTheMainPage: {
        actions: {
            pressMoreButton: function () {
                Helper.pressMoreButton(this, sViewName);
            },
            selectSalesOrder: function (iRow) {
                Helper.selectColumnListItem(this, sViewName, iRow);
            }
        }
    }
});