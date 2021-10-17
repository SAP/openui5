import Helper from "sap/ui/core/sample/common/Helper";
import AdaptSalesOrdersTable from "sap/ui/core/sample/odata/v4/SalesOrdersRTATest/tests/AdaptSalesOrdersTable";
import opaTest from "sap/ui/test/opaQunit";
Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrdersRTATest " + "- Adapt UI SalesOrdersTable");
opaTest("Adapt UI SalesOrdersTable", function (Given, When, Then) {
    AdaptSalesOrdersTable.adaptSalesOrdersTable(Given, When, Then, "sap.ui.core.sample.odata.v4.SalesOrdersRTATest");
});