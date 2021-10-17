import Helper from "sap/ui/core/sample/common/Helper";
import CreateRelativeTest from "sap/ui/core/sample/odata/v4/SalesOrders/tests/CreateRelative";
import opaTest from "sap/ui/test/opaQunit";
Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrdersRTATest - Create Relative", 180);
opaTest("Create, modify and delete within relative listbinding", function (Given, When, Then) {
    CreateRelativeTest.createRelative(Given, When, Then, "sap.ui.core.sample.odata.v4.SalesOrdersRTATest");
});