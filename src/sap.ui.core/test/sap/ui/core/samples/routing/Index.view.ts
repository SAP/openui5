import Button from "sap/ui/commons/Button";
sap.ui.jsview("sap.ui.core.samples.routing.Index", {
    getControllerName: function () {
        return "sap.ui.core.samples.routing.Index";
    },
    createContent: function (oController) {
        return new Button({ text: "Test" });
    }
});