sap.ui.define([], function () {
	"use strict";

	function compareTwoItems(oOptions) {
		var bSorted = true,
			iComparison = oOptions.previousText.localeCompare(oOptions.currentText);

		// check descending
		if (oOptions.descending && iComparison < 0) {
			bSorted = false;
		}
		if (!oOptions.descending && iComparison > 0) {
			bSorted = false;
		}


		if (!bSorted) {
			jQuery.sap.log.error("Item " + oOptions.currentText + " is not sorted compared with the previous one " + oOptions.previousText);
		}

		return bSorted;
	}

	return {
		descendingGroups: function() {
			return function (oList) {
				var bSorted = true,
					aGroupItems = oList.getItems().filter(function (oItem) {
						return oItem.getMetadata().getName() === "sap.m.GroupHeaderListItem";
					});

				aGroupItems.forEach(function (oItem, iIndex) {
					var oPreviousItem = aGroupItems[iIndex - 1];

					// skip the first item
					if (!oPreviousItem) {
						return;
					}

					bSorted = compareTwoItems({
						currentText: oItem.getTitle(),
						previousText: oPreviousItem.getTitle(),
						descending: true
					});
				});

				return bSorted;
			};
		},

		alphabeticallyInGroups: function () {
			return function (oList) {
				var bSorted = true,
					aItems = oList.getItems();

				aItems.forEach(function (oItem, iIndex) {
					var oPreviousItem = aItems[iIndex - 1];

					// skip the first item
					if (!oPreviousItem) {
						return;
					}

					// skip the first item in a group
					if (oPreviousItem.getMetadata().getName() === "sap.m.GroupHeaderListItem") {
						return;
					}

					// skip the group headers
					if (oItem.getMetadata().getName() === "sap.m.GroupHeaderListItem") {
						return;
					}

					bSorted = compareTwoItems({
						currentText: oItem.getTitle(),
						previousText: oPreviousItem.getTitle()
					});
				});

				return bSorted;
			};
		}
	};
});
