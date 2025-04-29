sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
    "use strict";

    return UIComponent.extend("testdata.manifest2.basic.Component", {
        metadata: {
            manifest: "json"
        },

        init: function() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // additional initialization can be done here
        }
    });
});