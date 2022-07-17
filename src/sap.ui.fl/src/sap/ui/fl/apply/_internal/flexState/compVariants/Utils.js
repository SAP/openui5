/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	var Utils = {};

	Utils.getPersistencyKey = function(oControl) {
		if (oControl) {
			var oVMControl = oControl.getVariantManagement && oControl.getVariantManagement() || oControl;
			if (oVMControl.getPersonalizableControlPersistencyKey) {
				return oVMControl.getPersonalizableControlPersistencyKey();
			}
			return oVMControl.getPersistencyKey && oVMControl.getPersistencyKey();
		}
	};

	return Utils;
});