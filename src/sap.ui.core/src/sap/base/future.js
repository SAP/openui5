/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/config",
	"sap/base/Log"
], (
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
			throw new Error(sMessage);
		}
		Log[sLevel]("[FUTURE FATAL]: " + sMessage, ...args);
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
		}
	};
	return future;
});
