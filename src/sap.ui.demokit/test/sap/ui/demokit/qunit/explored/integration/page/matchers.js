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
		},

		listWithItemsButNotThisOne: function (sTitle) {
			return function (oList) {
				var aListItems = oList.getItems(),
					bNoItemHasTheTitle;

				if (aListItems.length === 0) {
					// No items yet that's not valid for this matchers
					return false;
				}

				bNoItemHasTheTitle = aListItems.every(function (oItem) {
					return oItem.getTitle() !== sTitle;
				});

				return bNoItemHasTheTitle;
			};
		}
	};
});
