import Button from "sap/ui/commons/Button";
import Fragment from "sap/ui/core/Fragment";
sap.ui.jsfragment("samples.components.ext.customer.JSCustomFragWithCustomAction", {
    createContent: function (oController) {
        var oButton = new Button({
            text: "Hello World",
            press: oController.customerAction
        });
        return oButton;
    }
});