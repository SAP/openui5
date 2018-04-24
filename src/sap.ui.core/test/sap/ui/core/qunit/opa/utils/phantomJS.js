sap.ui.define([
], function() {
    "use strict";

    return {
        introduceSinonXHR: function () {
            QUnit.config.autostart = false;
            // HACK to have noglobals active - in phantom js this introduces XMLHttpRequest
            var XHR = sinon.useFakeXMLHttpRequest();
            XHR.restore();
        }
    };
});
