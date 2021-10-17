var defineCoupledProperty = function (oTarget, sTargetProperty, oSource, sSourceProperty) {
    var vValue = oSource[sSourceProperty];
    var oPropertyDescriptor = {
        configurable: true,
        get: function () {
            return vValue;
        },
        set: function (_vValue) {
            vValue = _vValue;
        }
    };
    Object.defineProperty(oTarget, sTargetProperty, oPropertyDescriptor);
    Object.defineProperty(oSource, sSourceProperty, oPropertyDescriptor);
};