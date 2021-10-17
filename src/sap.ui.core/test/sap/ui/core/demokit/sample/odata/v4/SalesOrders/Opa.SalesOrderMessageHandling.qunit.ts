import Helper from "sap/ui/core/sample/common/Helper";
import MessageHandling from "sap/ui/core/sample/odata/v4/SalesOrders/tests/MessageHandling";
import opaTest from "sap/ui/test/opaQunit";
Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrders - Message Handling");
opaTest("Message Handling", function (Given, When, Then) {
    MessageHandling.checkMessages(Given, When, Then);
});