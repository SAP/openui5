sap.ui.define([
		'sap/ui/test/Opa5',
		'test/page/Common',
		'test/page/matchers'
	],
	function(Opa5, Common, matchers) {
	"use strict";

	Opa5.createPageObjects({

		onTheEntityPage : {
			baseClass: Common,
			actions : {
				iPressOnTheSample : function (sSampleName) {
					return this.waitFor({
						id : "table",
						viewName: "entity",
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
			}
		}

	});

});
