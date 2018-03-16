jQuery.sap.declare("sap.uxap.sample.blockscolor.BlockBlue");
jQuery.sap.require("sap.uxap.BlockBase");

sap.uxap.BlockBase.extend("sap.ui.rta.test.Demo.ObjectPage.blockscolor.BlockBlue", {
    metadata: {
        views: {
            Collapsed: {
                viewName: "sap.ui.rta.test.Demo.ObjectPage.blockscolor.BlockBlue",
                type: "XML"
            },
            Expanded: {
                viewName: "sap.ui.rta.test.Demo.ObjectPage.blockscolor.BlockBlue",
                type: "XML"
            }
        }
    }
});