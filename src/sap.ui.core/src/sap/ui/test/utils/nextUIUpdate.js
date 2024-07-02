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
     * <b>Note:</b> No module from <code>sap/ui/test</code> should be used for productive coding!
     *
     * @alias module:sap/ui/test/utils/nextUIUpdate
     * @since 1.127
     * @public
     * @param {{tick: function()}} [clock] An optional sinon clock. When using sinon faketimers the clock must be ticked to ensure async rendering.
     *  Async rendering is done with a setTimeout(0) so, when given, we tick the clock by 1.
     * @returns {Promise<undefined>} A promise resolving when the next UI update is finished or rejecting when the next update fails.
     */
    function nextUIUpdate(clock) {
        return new Promise(function(resolve, reject) {
            function isUpdated(oEvent) {
                Rendering.detachUIUpdated(isUpdated);
                const error = oEvent.getParameter("failed");
                if (error) {
                    // prevent default: Rendering will not rethrow the error wich breaks a unit test even if the rejection is properly catched.
                    oEvent.preventDefault();
                    reject(error);
                } else {
                    resolve();
                }
            }

            if (Rendering.isPending()) {
                Rendering.attachUIUpdated(isUpdated);
                clock?.tick?.();
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
     * @deprecated as of 1.127, future versions of UI5 won't support synchronous rendering anymore.
     */
    nextUIUpdate.runSync = function() {
        Log.warning("Synchronous rendering forced: Please migrate to asynchronous rendering");
        Rendering.renderPendingUIUpdates("forced sync rendering...");
    };

    return nextUIUpdate;
});
