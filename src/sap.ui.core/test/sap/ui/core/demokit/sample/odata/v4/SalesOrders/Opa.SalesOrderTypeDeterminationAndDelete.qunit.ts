import Helper from "sap/ui/core/sample/common/Helper";
import TypeDeterminationAndDeleteTest from "sap/ui/core/sample/odata/v4/SalesOrders/tests/TypeDeterminationAndDelete";
import opaTest from "sap/ui/test/opaQunit";
Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrders - Type Determination and Delete");
opaTest("Type Determination, Delete Sales Orders", function (Given, When, Then) {
    TypeDeterminationAndDeleteTest.typeDeterminationAndDelete(Given, When, Then);
});