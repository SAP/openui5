/*!
 * ${copyright}
 */
sap.ui.define([], function() {
    "use strict";

    var MemoryConfigurationProvider = function() {
        this.oConfig = Object.create(null);
    };

    MemoryConfigurationProvider.prototype.get = function(sName) {
        return this.oConfig[sName];
    };

    MemoryConfigurationProvider.prototype.set = function(sName, vValue) {
        var rValidKey = /^[a-z][A-Za-z0-9]*$/;
        if (rValidKey.test(sName)) {
            this.oConfig[sName] = vValue;
        } else {
            throw new TypeError(
                "Invalid configuration key '" + sName + "'!"
            );
        }
    };

    return MemoryConfigurationProvider;
});