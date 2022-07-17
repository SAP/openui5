/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	var Common = {
		cleanup: function (oTarget, aFields) {
			aFields.forEach(function (sField) {
				var oRemovable = oTarget[sField];
				if (oRemovable) {
					if (oRemovable.destroy && !oRemovable.bIsDestroyed) {
						oRemovable.destroy();
					}
					oTarget[sField] = null;
				}
			});
		}
	};

	return Common;

});
