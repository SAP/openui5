sap.ui.define(['sap/ui/core/Control'], function(Control) {
    "use strict";

    const clazz = Control.extend("testdata.mvc.controls.ModuleWithPromiseExport", {
        metadata: {},
        renderer: function(oRm, oControl) {
            oRm.openStart("div", oControl);
            oRm.openEnd();
        }
    });

    return new Promise(function(resolve) {
        resolve(clazz);
    });
});