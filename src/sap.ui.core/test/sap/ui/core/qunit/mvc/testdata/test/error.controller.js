sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("testdata.customizing.sap.Sub2", {
        onInit: function () {
            throw new Error("Controller error");
        }
    });
});
