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

	const bConfiguredFuture = BaseConfig.get({
		name: "sapUiXxFuture",
		type: BaseConfig.Type.Boolean,
		external: true
	});

	let bFuture = bConfiguredFuture;

	function throws(sLevel, sMessage, ...args) {
		if (bFuture) {
			throw new Error(sMessage);
		}
		Log[sLevel]("[FUTURE FATAL] " + sMessage, ...args);
	}

	function reject(resolve, reject, sLevel, sMessage, ...args) {
		if (bFuture) {
			reject(new Error(sMessage));
			return;
		}
		resolve();
		Log[sLevel]("[FUTURE FATAL] " + sMessage, ...args);
	}

	/**
	 * Logs '[FUTURE FATAL]' marker in messages and throws error if
	 * 'sap-ui-xx-future' config option is set to true.
	 *
	 * @alias module:sap/base/future
	 * @namespace
	 * @private
	 * @ui5-restricted sap.base, sap.ui.core
	 */
	const future = {
		get active() {
			return bFuture;
		},
		set active(bValue) {
			bFuture = !!(bValue ?? bConfiguredFuture);
		},
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
		},
		warningRejects(fnResolve, fnReject, ...args) {
			reject(fnResolve, fnReject, "warning", ...args);
		}
	};
	return future;
});
