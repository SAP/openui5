import Helper from "sap/ui/core/sample/common/Helper";
import ChangeContextTest from "sap/ui/core/sample/odata/v4/SalesOrders/tests/ChangeContext";
import opaTest from "sap/ui/test/opaQunit";
import TestUtils from "sap/ui/test/TestUtils";
Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrders - Change Context");
if (TestUtils.isRealOData()) {
    QUnit.skip("Test runs only with realOData=false");
}
else {
    opaTest("Change dependent binding, change context and check", function (Given, When, Then) {
        ChangeContextTest.changeContext(Given, When, Then);
    });
}