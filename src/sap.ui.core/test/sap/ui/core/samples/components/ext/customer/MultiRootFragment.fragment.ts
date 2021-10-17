import Button from "sap/ui/commons/Button";
import Fragment from "sap/ui/core/Fragment";
sap.ui.jsfragment("samples.components.ext.customer.MultiRootFragment", {
    createContent: function (oController) {
        var aContent = [new Button(this.createId("customerButton1"), {
                text: "Hello World"
            }), new Button(this.createId("customerButton2"), {
                text: "Hello Button"
            })];
        return aContent;
    }
});