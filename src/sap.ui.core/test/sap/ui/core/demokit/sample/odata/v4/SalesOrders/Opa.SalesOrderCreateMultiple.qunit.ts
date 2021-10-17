import Helper from "sap/ui/core/sample/common/Helper";
import CreateMultiple from "sap/ui/core/sample/odata/v4/SalesOrders/tests/CreateMultiple";
import opaQunit from "sap/ui/test/opaQunit";
Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrders - Create Multiple", 180);
opaQunit("Multiple create, modify and delete", function (Given, When, Then) {
    CreateMultiple.createMultiple(Given, When, Then);
});