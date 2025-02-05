sap.ui.define(['sap/ui/core/Control'], function(Control) {
    "use strict";

    return Control.extend("testdata.mvc.controls.RegularControl", {
        metadata: {},
        renderer: function(oRm, oControl) {
            oRm.openStart("div", oControl);
            oRm.openEnd();
        }
    });
});