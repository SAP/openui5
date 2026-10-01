sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageToast"], (Controller, MessageToast) => {
    "use strict";
    return Controller.extend("htmlsample.Main", {
        nativeButtonClick: () => {
            // eslint-disable-next-line no-alert
            alert("Why did you do it?!");
        },
        nativeButtonMouseover: () => {
            MessageToast.show("Don't click me!");
        }
    });
});