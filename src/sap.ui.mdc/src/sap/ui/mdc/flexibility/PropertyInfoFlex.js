/*!
 * ${copyright}
 */
sap.ui.define([], () => {
	"use strict";

	//obsolete
	const oPropertyInfoFlex = {};

	oPropertyInfoFlex.addPropertyInfo = {
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {},
			revertChange: function(oChange, oControl, mPropertyBag) {}
		},
		"layers": {
			"USER": true
		}
	};

	return oPropertyInfoFlex;
});