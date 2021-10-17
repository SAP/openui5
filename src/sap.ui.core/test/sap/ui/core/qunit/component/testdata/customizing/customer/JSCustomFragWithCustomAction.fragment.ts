import Button from "sap/ui/commons/Button";
import Fragment from "sap/ui/core/Fragment";
sap.ui.jsfragment("testdata.customizing.customer.JSCustomFragWithCustomAction", {
    createContent: function (oController) {
        var oButton = new Button("buttonWithCustomerAction", {
            text: "Hello World",
            press: oController.customerAction
        });
        return oButton;
    }
});