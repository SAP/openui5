/*!
 * ${copyright}
 */
sap.ui.define([
], function() {
	"use strict";

	function _enforceNoReturnValue(vResult, mLogInfo) {
		if (vResult !== undefined) {
			const sFunctionName = mLogInfo.name ? `'${mLogInfo.name}' ` : '';
			throw new Error(`${mLogInfo.component}: The registered Event Listener ${sFunctionName}must not have a return value.`);
		}
	}
	return _enforceNoReturnValue;
});
