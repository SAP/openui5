/*!
 * ${copyright}
 */
sap.ui.define(function () {
	"use strict";

	return function (oControl) {
		function findUp(oControl) {
			if (oControl) {
				if (oControl.isA("sap.ui.integration.designtime.baseEditor.BaseEditor")) {
					return oControl;
				} else {
					return findUp(oControl.getParent());
				}
			}
		}
		return findUp(oControl);
	};
});
