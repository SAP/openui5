sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	Opa5.createPageObjects({
		onTheEntityPage: {
			viewName: "Entity",
			actions: {
				iPressOnTheSample : function (sSampleName) {
					return this.waitFor({
						id : "table",
						matchers: function (oTable) {
							var oMatchingListItem,
								bHasItemWithTheName = oTable.getItems().some(function (oItem) {
									if (oItem.getCells()[0].getText() === sSampleName) {
										oMatchingListItem = oItem;
										return true;
									}
								});

							return bHasItemWithTheName && oMatchingListItem;
						},
						success : function (oListItem) {
							oListItem.$().trigger("tap");
						},
						errorMessage: "Did not find the sample " + sSampleName
					});
				}
			},

			assertions: {

			}
		}
	});

});
