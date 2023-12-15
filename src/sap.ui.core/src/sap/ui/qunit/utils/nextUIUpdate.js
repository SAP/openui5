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
     * @param {sinon.clock} [clock] A sinon clock. When using sinon faketimers the clock must be ticked to ensure async rendering.
     *  Async rendering is done with a setTimeout(0) so we tick a given clock by 1.
     * @returns {Promise<undefined>} A promise resolving when the next UI update is finished or rejecting when the next update fails.
     */
    function nextUIUpdate(clock) {
        return new Promise(function(resolve, reject) {
            function isUpdated(params) {
                Rendering.detachUIUpdated(isUpdated);
                const error = params.getParameter("failed");
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            }

            if (Rendering.isPending()) {
                Rendering.attachUIUpdated(isUpdated);
                clock?.tick?.(1);
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
