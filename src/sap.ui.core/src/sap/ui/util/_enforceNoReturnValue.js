/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log"
], function(Log) {
	"use strict";

	function _enforceNoReturnValue(vResult, mLogInfo) {
		if (vResult !== undefined) {
			const sFunctionName = mLogInfo.name ? `'${mLogInfo.name}' ` : '';
			// @deprecated
			if (typeof vResult.then === "function") {
				vResult.catch((err) => {
					Log.error(`The registered Event Listener ${sFunctionName}of '${mLogInfo.component}' failed.`, err);
				});
			}
			// for any return value other than 'undefined'
			Log.error(`[FUTURE FATAL] The registered Event Listener ${sFunctionName}must not have a return value.`, mLogInfo.component);
		}
	}
	return _enforceNoReturnValue;
});
