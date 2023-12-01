/*!
 * ${copyright}
 */

sap.ui.define([], () => {
	"use strict";

	const Common = {
		cleanup: function(oTarget, aFields) {
			aFields.forEach((sField) => {
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