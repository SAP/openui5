import HorizontalLayout from "sap/ui/layout/HorizontalLayout";
import Button from "sap/m/Button";
sap.ui.jsfragment("testdata.fragments.JSTestFragment", {
    createContent: function (oController) {
        var oLayout = new HorizontalLayout();
        var oButton = new Button(this.createId("btnInJsFragment"), {
            text: "Hello JS World",
            press: oController.doSomething
        });
        oLayout.addContent(oButton);
        oButton = new Button({
            text: "{/someText}"
        });
        oLayout.addContent(oButton);
        return oLayout;
    }
});