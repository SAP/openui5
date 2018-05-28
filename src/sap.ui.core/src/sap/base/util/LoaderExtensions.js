/*!
 * ${copyright}
 */

sap.ui.define(function() {
    "use strict";

    /**
     * Utilities extending the <code>sap.ui.loader</code> functionalities
     *
     * @sap-restricted sap.ui.core
     */
    var LoaderExtensions = {};

    /**
     * Returns the names of all required modules.
     * @return {string[]} the names of all required modules
     * @static
     * @sap-restricted sap.ui.core
     */
    LoaderExtensions.getAllRequiredModules = function() {
        var aModuleNames = [],
            mModules = sap.ui.loader._.getAllModules(true),
            oModule;

        for (var sModuleName in mModules) {
            oModule = mModules[sModuleName];
            // filter out preloaded modules
            if (oModule.ui5 && oModule.state !== -1 /* PRELOADED */) {
                aModuleNames.push(oModule.ui5);
            }
        }
        return aModuleNames;
    };

    return LoaderExtensions;

});