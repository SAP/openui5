/*!
 * ${copyright}
 */
sap.ui.define(function () {
	"use strict";

	return function (oControl, sClassName) {
		function findUp(oControl) {
			if (oControl) {
				if (oControl.isA(sClassName)) {
					return oControl;
				} else {
					return findUp(oControl.getParent());
				}
			}
		}
		return findUp(oControl);
	};
});
