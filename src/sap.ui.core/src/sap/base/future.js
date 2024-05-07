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

	/**
	 *
	 * @param {string} sLevel The log level (e.g., 'info', 'warning', 'error').
	 * @param {string} sMessage The main log message.
	 * @param {object} [mOptions] An object containing further log message details.
	 * @param {object} [mOptions.suffix] Additional details relevant for logging only, appended to the main log message.
	 * @param {object} [mOptions.cause] The original error instance causing the error, used for rethrowing.
	 * @param {...any} args Additional arguments to be logged.
	 * @throws {Error} in 'future' mode
	 * @returns {void}
	 */
	function throws(sLevel, sMessage, mOptions, ...args) {
		if (bFuture) {
			throw new Error(sMessage, { cause: mOptions?.cause });
		}

		if (mOptions) {
			if (mOptions.suffix) {
				sMessage += " " + mOptions.suffix;
			} else {
				args.unshift(mOptions);
			}
		}

		Log[sLevel]("[FUTURE FATAL] " + sMessage, ...args);
	}

	/**
 	 *
 	 * @param {function} resolve The resolve function of the Promise.
 	 * @param {function} reject The reject function of the Promise.
 	 * @param {string} sLevel The log level (e.g., 'info', 'warning', 'error').
 	 * @param {string} sMessage The main log message.
 	 * @param {object} [mOptions] An object containing further log message details.
 	 * @param {object} [mOptions.suffix] Additional details relevant for logging only, appended to the main log message.
	 * @param {object} [mOptions.cause] The original error instance causing the error, used for rethrowing.
 	 * @param {...any} args Additional arguments to be logged.
 	 * @returns {void}
 	 */
	function reject(resolve, reject, sLevel, sMessage, mOptions, ...args) {
		if (bFuture) {
			reject(new Error(sMessage, { cause: mOptions?.cause }));
			return;
		}

		if (mOptions) {
			if (mOptions.suffix) {
				sMessage += " " + mOptions.suffix;
			} else {
				args.unshift(mOptions);
			}
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
