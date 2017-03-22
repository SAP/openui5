sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Sorts icons by icon name
		 * @param {Object} oContext1 The first context
		 * @param {Object} oContext2 The second context
		 * @return {number} the sorting result (-1, 0, 1)
		 */
		sortByName : function(oContext1, oContext2) {
			if (!oContext1 || !oContext1.name) {
				return -1;
			} else if (!oContext2 || !oContext2.name) {
				return 1;
			} else {
				var sContext1Name = oContext1.name.toLowerCase();
				var sContext2Name = oContext2.name.toLowerCase();

				if (sContext1Name < sContext2Name) {
					return -1;
				} else {
					return (sContext1Name > sContext2Name) ? 1 : 0;
				}
			}
		}
	};
});
