var lazyProperty = function (oTarget, sProperty, fnCallback, sMarker) {
    var oPropertyDescriptor = {
        configurable: true,
        get: function () {
            delete oTarget[sProperty];
            oTarget[sProperty] = fnCallback();
            return oTarget[sProperty];
        },
        set: function (vValue) {
            delete oTarget[sProperty];
            oTarget[sProperty] = vValue;
        }
    };
    if (sMarker) {
        oPropertyDescriptor.get[sMarker] = true;
    }
    Object.defineProperty(oTarget, sProperty, oPropertyDescriptor);
};