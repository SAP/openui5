import Button from "sap/m/Button";
sap.ui.jsview("error.test.JSView", {
    createContent: function (oController) {
        return new Button({
            text: "click me"
        });
    }
});