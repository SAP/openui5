import Button from "sap/ui/commons/Button";
sap.ui.jsview("sap.ui.core.mvctest.Dev2", {
    getControllerName: function () {
        return "sap.ui.core.mvctest.Dev";
    },
    createContent: function (oController) {
        var aControls = [];
        var oButton = new Button({ text: "Hello JS View 2" });
        aControls.push(oButton.attachPress(oController.doIt, oController));
        return aControls;
    }
});