import MessageToast from "sap/m/MessageToast";
sap.ui.controller("samples.components.ext.customer.Sub4ControllerExtension", {
    customerAction: function () {
        MessageToast.show("This is a customer Action");
    }
});