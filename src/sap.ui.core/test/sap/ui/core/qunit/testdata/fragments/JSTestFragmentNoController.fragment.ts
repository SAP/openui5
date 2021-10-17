import HorizontalLayout from "sap/ui/layout/HorizontalLayout";
import Button from "sap/m/Button";
sap.ui.jsfragment("testdata.fragments.JSTestFragmentNoController", {
    createContent: function (oController) {
        var oLayout = new HorizontalLayout();
        var oButton = new Button({
            text: "{/someText}"
        });
        oLayout.addContent(oButton);
        QUnit.config.current.assert.equal(oController, undefined, "Controller should not be given");
        return oLayout;
    }
});