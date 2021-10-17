import Helper from "sap/ui/core/sample/common/Helper";
import CreateTest from "sap/ui/core/sample/odata/v4/SalesOrders/tests/Create";
import opaTest from "sap/ui/test/opaQunit";
Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrders - Create", 180);
opaTest("Create, modify and delete", function (Given, When, Then) {
    CreateTest.create(Given, When, Then);
});