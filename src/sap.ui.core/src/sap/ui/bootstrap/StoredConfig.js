/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global localStorage */
sap.ui.define(['sap/base/log'], function(log) {

	"use strict";

	// @evo-todo isn't the whole module browser specific? localStorage at least is...

	// Reads the value for the given key from the localStorage or writes a new value to it.
	function makeLocalStorageAccessor(key, type, callback) {
		return function(value) {
			try {
				if ( value != null || type === 'string' ) {
					if (value) {
						localStorage.setItem(key, type === 'boolean' ? 'X' : value);
					} else {
						localStorage.removeItem(key);
					}
					callback(value);
				}
				value = localStorage.getItem(key);
				return type === 'boolean' ? value === 'X' : value;
			} catch (e) {
				log.warning("Could not access localStorage while accessing '" + key + "' (value: '" + value + "', are cookies disabled?): " + e.message);
			}
		};
	}

	return {
		debug: makeLocalStorageAccessor('sap-ui-debug', '', function reloadHint(vDebugInfo) {
			/*eslint-disable no-alert */
			alert("Usage of debug sources is " + (vDebugInfo ? "on" : "off") + " now.\nFor the change to take effect, you need to reload the page.");
			/*eslint-enable no-alert */
		}),
		/**
		 * Sets the URL to reboot this app from, the next time it is started. Only works with localStorage API available
		 * (and depending on the browser, if cookies are enabled, even though cookies are not used).
		 *
		 * @param {string} sRebootUrl the URL to sap-ui-core.js, from which the application should load UI5 on next restart; undefined clears the restart URL
		 * @returns {string} the current reboot URL or undefined in case of an error or when the reboot URL has been cleared
		 *
		 * @private
		 */
		setReboot : makeLocalStorageAccessor('sap-ui-reboot-URL', 'string', function rebootUrlHint(sRebootUrl) { // null-ish clears the reboot request
			if ( sRebootUrl ) {
				/*eslint-disable no-alert */
				alert("Next time this app is launched (only once), it will load UI5 from:\n" + sRebootUrl + ".\nPlease reload the application page now.");
				/*eslint-enable no-alert */
			}
		}),

		statistics : makeLocalStorageAccessor('sap-ui-statistics', 'boolean', function gatewayStatsHint(bUseStatistics) {
			/*eslint-disable no-alert */
			alert("Usage of Gateway statistics " + (bUseStatistics ? "on" : "off") + " now.\nFor the change to take effect, you need to reload the page.");
			/*eslint-enable no-alert */
		})
	};
});