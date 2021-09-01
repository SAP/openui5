sap.ui.define(['./Log'], function (Log) { 'use strict';

    var fnAssert = function (bResult, vMessage) {
        if (!bResult) {
            var sMessage = typeof vMessage === 'function' ? vMessage() : vMessage;
            if (console && console.assert) {
                console.assert(bResult, sMessage);
            } else {
                Log.debug('[Assertions] ' + sMessage);
            }
        }
    };

    return fnAssert;

});
