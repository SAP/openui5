/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	return function (oRta) {
		var oSelectionManager = oRta._oDesignTime.getSelectionManager();

		return {
			exports: {
				get: oSelectionManager.get.bind(oSelectionManager),
				set: oSelectionManager.set.bind(oSelectionManager),
				add: oSelectionManager.add.bind(oSelectionManager),
				remove: oSelectionManager.remove.bind(oSelectionManager)
			}
		};
	};
});