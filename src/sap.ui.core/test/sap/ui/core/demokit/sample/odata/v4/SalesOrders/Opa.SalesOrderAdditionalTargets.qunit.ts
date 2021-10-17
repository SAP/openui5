import Helper from "sap/ui/core/sample/common/Helper";
import additionalTargets from "sap/ui/core/sample/odata/v4/SalesOrders/tests/additionalTargets";
import opaTest from "sap/ui/test/opaQunit";
Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrders - Additional Targets");
opaTest("Additional targets", function (Given, When, Then) {
    additionalTargets(Given, When, Then);
});