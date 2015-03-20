sap.ui.define([], function () {
	"use strict";

	return {
		listItemWithTitle : function (sTitle) {
			return function (oList) {
				var oMatchingListItem,
					bHasItemWithTheName = oList.getItems().some(function (oItem) {
						if (oItem.getTitle() === sTitle) {
							oMatchingListItem = oItem;
							return true;
						}
					});

				return bHasItemWithTheName && oMatchingListItem;
			};
		}
	};
});
