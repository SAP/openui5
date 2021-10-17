import Log from "sap/base/Log";
import MessageToast from "sap/m/MessageToast";
sap.ui.controller("samples.components.ext.customer.Sub2ControllerExtension", {
    onInit: function () {
        Log.info("Sub2ControllerExtension Controller onInit()");
    },
    onExit: function () {
        Log.info("Sub2ControllerExtension Controller onExit()");
    },
    onBeforeRendering: function () {
        Log.info("Sub2ControllerExtension Controller onBeforeRendering()");
    },
    onAfterRendering: function () {
        Log.info("Sub2ControllerExtension Controller onAfterRendering()");
    },
    customerAction: function () {
        MessageToast.show("This is a customer Action");
    }
});