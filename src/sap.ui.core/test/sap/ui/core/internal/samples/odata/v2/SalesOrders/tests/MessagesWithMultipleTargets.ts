import Helper from "sap/ui/core/sample/common/Helper";
import opaTest from "sap/ui/test/opaQunit";
Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - Multiple Targets");
opaTest("Check messages with multiple targets", function (Given, When, Then) {
    Given.iStartMyUIComponent({
        componentConfig: {
            name: "sap.ui.core.internal.samples.odata.v2.SalesOrders"
        }
    });
    When.onMainPage.showSalesOrder("108");
    Then.onMainPage.checkSalesOrderLoaded("108");
    Then.onMainPage.checkSalesOrderItemsLoaded("108");
    When.onMainPage.changeItemQuantity(0, 1);
    When.onMainPage.changeItemNote(0, "none");
    When.onMainPage.pressSalesOrderSaveButton();
    When.onMainPage.toggleMessagePopover();
    Then.onMainPage.checkMessageNotInPopover("010");
    When.onMainPage.toggleMessagePopover();
    When.onMainPage.rememberCurrentMessageCount();
    When.onMainPage.changeItemQuantity(0, 2);
    When.onMainPage.pressSalesOrderSaveButton();
    Then.onMainPage.checkMessageCountHasChangedBy(1);
    Then.onMainPage.checkValueStateOfField(0, "Note", "Warning", "approval");
    Then.onMainPage.checkValueStateOfField(0, "Quantity", "Warning", "approval");
    When.onMainPage.toggleMessagePopover();
    Then.onMainPage.checkMessageInPopover("010", "approval");
    When.onMainPage.openTechnicalDetails();
    Then.onMainPage.checkMessageHasTechnicalDetail("target::messageDetails", "/SalesOrderLineItemSet(SalesOrderID='108',ItemPosition='010')/Quantity\n" + "/SalesOrderLineItemSet(SalesOrderID='108',ItemPosition='010')/Note");
    Then.onMainPage.checkMessageHasTechnicalDetail("fullTarget::messageDetails", "/SalesOrderSet('108')/ToLineItems(SalesOrderID='108',ItemPosition='010')/Quantity\n" + "/SalesOrderSet('108')/ToLineItems(SalesOrderID='108',ItemPosition='010')/Note");
    When.onMainPage.closeDialog("Message Details");
    When.onMainPage.toggleMessagePopover();
    When.onMainPage.changeItemNote(0, "reason");
    When.onMainPage.pressSalesOrderSaveButton();
    Then.onMainPage.checkValueStateOfField(0, "Note", "None");
    Then.onMainPage.checkValueStateOfField(0, "Quantity", "None");
    Then.onMainPage.checkMessageCountHasChangedBy(-1);
    When.onMainPage.toggleMessagePopover();
    Then.onMainPage.checkMessageNotInPopover("010");
    When.onMainPage.toggleMessagePopover();
    Given.iTeardownMyApp();
});