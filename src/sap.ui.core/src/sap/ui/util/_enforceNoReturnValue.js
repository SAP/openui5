/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/future"
], function(future) {
	"use strict";

	function _enforceNoReturnValue(vResult, mLogInfo) {
		if (vResult !== undefined) {
			const sFunctionName = mLogInfo.name ? `'${mLogInfo.name}' ` : '';
			// for any return value other than 'undefined'
			future.fatalThrows(`${mLogInfo.component}: The registered Event Listener ${sFunctionName}must not have a return value.`);
		}
	}
	return _enforceNoReturnValue;
});
