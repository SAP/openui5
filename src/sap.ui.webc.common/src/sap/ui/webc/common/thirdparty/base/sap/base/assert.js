sap.ui.define(['./Log'], function (Log) { 'use strict';

    var fnAssert = function (bResult, vMessage) {
        if (!bResult) {
            var sMessage = typeof vMessage === 'function' ? vMessage() : vMessage;
            console.assert(bResult, sMessage);
        }
    };

    return fnAssert;

});
