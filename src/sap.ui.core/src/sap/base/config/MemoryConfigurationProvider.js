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
        this.oConfig[sName] = vValue;
    };

    return MemoryConfigurationProvider;
});