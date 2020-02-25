sap.ui.define(['sap/ui/core/Fragment'],
	function(Fragment) {
    "use strict";

    var ExtensionPointProvider = {
        /**
         * <code>ExtensionPointProvider.applyExtensionPoint</code> is called during XMLView processing once all necessary information
         * is collected.
         *
         * After inserting the final controls into the target aggregation of the target control,
         * the ready() function on the oExtensionPoint object must be called.
         *
         * @param {object} oExtensionPoint an object containing all necessary information to process the ExtensionPoint.
         * Documentation of all available properties and functions can be found in {@link sap.ui.core.ExtensionPoint}.
         * @returns {Promise} a Promise which resolves once the
         */
        applyExtensionPoint: function(oExtensionPoint) {
            var pLoaded;

            var fnInsert = function(aControls) {
                aControls.forEach(function(oControl, i) {
                    oExtensionPoint.targetControl.insertAggregation(oExtensionPoint.aggregationName, oControl, oExtensionPoint.index + i);
                });
            };

            if (oExtensionPoint.name === "EP1") {
                pLoaded =  Fragment.load({
                    id: oExtensionPoint.view.createId("customFragment"),
                    name: "testdata.customizing.customer.ext.Custom"
                });

                /**
                 * Need the owner component?
                 *
                 * var oComponent = sap.ui.core.Component.getOwnerComponentFor(oExtensionPoint.view);
                 * oComponent.runAsOwner(function() {
                 *    // create controls
                 * });
                 */

                pLoaded.then(function(vControls) {
                    if (!Array.isArray(vControls)) {
                        vControls = [vControls];
                    }
                    fnInsert(vControls);
                    oExtensionPoint.ready(vControls);
                });
            } else {
                pLoaded = new Promise(function(resolve, reject) {
                    // NOTE:
                    // createDefault() can also return an array of controls synchronously!
                    oExtensionPoint.createDefault().then(function(aControls) {
                        fnInsert(aControls);
                        oExtensionPoint.ready(aControls);
                        resolve(aControls);
                    });
                });
            }

            return pLoaded;
        }
    };

    return ExtensionPointProvider;
});