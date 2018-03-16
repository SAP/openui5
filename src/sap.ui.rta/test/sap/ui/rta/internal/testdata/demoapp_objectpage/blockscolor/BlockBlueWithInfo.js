jQuery.sap.declare("sap.ui.rta.test.Demo.ObjectPage.blockscolor.BlockBlueWithInfo");
jQuery.sap.require("sap.uxap.BlockBase");

sap.uxap.BlockBase.extend("sap.ui.rta.test.Demo.ObjectPage.blockscolor.BlockBlueWithInfo", {
    metadata: {
        views: {
            Collapsed: {
                viewName: "sap.ui.rta.test.Demo.ObjectPage.blockscolor.BlockBlueWithInfo",
                type: "XML"
            },
            Expanded: {
                viewName: "sap.ui.rta.test.Demo.ObjectPage.blockscolor.BlockBlueWithInfo",
                type: "XML"
            }
        }
    }
});