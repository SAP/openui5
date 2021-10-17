import HorizontalLayout from "sap/ui/layout/HorizontalLayout";
import Button from "sap/m/Button";
sap.ui.jsfragment("fixture.OpaPlugin", {
    createContent: function () {
        var oLayout = new HorizontalLayout();
        var oButton = new Button(this.createId("fragmentButton"), {
            text: "Hello world"
        });
        oLayout.addContent(oButton);
        return oLayout;
    }
});