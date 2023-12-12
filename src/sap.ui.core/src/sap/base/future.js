/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/assert",
	"sap/base/config",
	"sap/base/Log"
], (
	assert,
	BaseConfig,
	Log
) => {
	"use strict";

	const bFuture = BaseConfig.get({
		name: "sapUiXxFuture",
		type: BaseConfig.Type.Boolean,
		external: true
	});

	function throws(sLevel, sMessage, ...args) {
		if (bFuture) {
			Log.fatal(sMessage, ...args);
			throw new Error(sMessage);
		}
		Log[sLevel]("[FUTURE FATAL] " + sMessage, ...args);
	}
	/**
	 * Logs '[FUTUR FATAL]' marker in messages and throws error if
	 * 'sap-ui-xx-future' config option is set to true.
	 *
	 * @private
	 * @ui5-restricted sap.base, sap.ui.core
	 */
	const future = {
		fatalThrows(...args) {
			throws("fatal", ...args);
		},
		errorThrows(...args) {
			throws("error", ...args);
		},
		warningThrows(...args) {
			throws("warning", ...args);
		},
		assertThrows(bResult, vMessage) {
			const sMessage = typeof vMessage === "function" ? vMessage() : vMessage;
			if (!bResult && bFuture) {
				throw new Error(vMessage);
			}
			assert(bResult, "[FUTURE FATAL] " + sMessage);
		}
	};
	return future;
});
