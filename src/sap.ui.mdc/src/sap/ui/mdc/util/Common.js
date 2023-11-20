/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	const Common = {
		cleanup: function (oTarget, aFields) {
			aFields.forEach(function (sField) {
				const oRemovable = oTarget[sField];
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
