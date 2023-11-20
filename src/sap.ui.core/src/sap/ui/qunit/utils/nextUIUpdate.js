/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Rendering"
], function(
    Log,
    Rendering
) {
	"use strict";

    /**
     * Return a Promise that resolves when the next Rendering is ready.
     * If no rendering is sheduled it resolves immediately.
     *
     * @namespace
     * @alias module:sap/ui/qunit/utils/nextUIUpdate
     * @public
     * @returns {Promise<undefined>} A promise resolving when the next UI update is finished
     */
    function nextUIUpdate() {
        return new Promise(function(resolve) {
            function isUpdated() {
                Rendering.detachUIUpdated(isUpdated);
                resolve();
            }

            if (Rendering.isPending()) {
                Rendering.attachUIUpdated(isUpdated);
            } else {
                resolve();
            }
        });
    }

    /**
     * Force a synchrounous rendering.
     *
     * @function
     * @private
     */
    nextUIUpdate.runSync = function() {
        Log.warning("Synchronous rendering forced: Please migrate to asynchronous rendering");
        Rendering.renderPendingUIUpdates("forced sync rendering...");
    };

    return nextUIUpdate;
});
