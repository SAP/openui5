import Button from "sap/ui/commons/Button";
import TextView from "sap/ui/commons/TextView";
import VerticalLayout from "sap/ui/commons/layout/VerticalLayout";
sap.ui.jsview("sap.ui.core.mvctest.Test", {
    getControllerName: function () {
        return "sap.ui.core.mvctest.Test";
    },
    createContent: function (oController) {
        var aControls = [];
        var oText = new TextView({ text: "JS View with a Button attached to a controller function:" });
        var oButton = new Button(this.createId("myButton"), { text: "Press Me" });
        oButton.attachPress(oController.doIt, oController);
        var oLayout = new VerticalLayout("Layout1", {
            content: [oText, oButton]
        });
        aControls.push(oLayout);
        return aControls;
    }
});