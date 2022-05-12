/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/base/SyncPromise"], function(SyncPromise) {
	"use strict";

	/**
	 * Convenience function for dom-ready.
	 * Returns (Sync)Promise which resolves when DOM content has been loaded.
	 *
	 * @param  {boolean} bSync Whether handler should be executed synchronously or not.
	 * @return {Promise|sap.ui.base.SyncPromise} Returns Promise or SyncPromise resolving when DOM is ready.
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	return function() {
		// In case the DOMContentLoaded was already fired,
		// the ready handler needs to be executed directly.
		return new SyncPromise(function(resolve, reject) {
			if (document.readyState !== "loading") {
				resolve();
			} else {
				var fnDomReady = function(res) {
					document.removeEventListener("DOMContentLoaded", fnDomReady);
					resolve();
				};
				document.addEventListener("DOMContentLoaded", fnDomReady);
			}
		});
	};
});