sap.ui.define(["sap/ui/core/mvc/View", "sap/m/Button"], function(View, Button) {
    "use strict";

    return View.extend("testdata.manifest2.basic.views.TypedMain", {
        getControllerName: function() {
            return "testdata.manifest2.basic.views.Main";
        },

        createContent: function(oController) {
            return new Button({
                text: "Hello World"
            });
        }
    });
});
