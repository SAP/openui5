sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/AggregationFilled',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/test/matchers/AggregationContainsPropertyEqual'
	], function (Opa5, AggregationFilled, PropertyStrictEquals, AggregationContainsPropertyEqual) {

		Opa5.createPageObjects({
			onTheCart : {

				actions : {

					iPressOnTheEditButton : function () {
						return this.waitFor({
							viewName : "Cart",
							controlType : "sap.m.Button",
							matchers : new PropertyStrictEquals({name : "icon", value : "sap-icon://edit"}),
							success : function (aButtons) {
								aButtons[0].$().trigger("tap");
							},
							errorMessage : "The edit button could not be pressed"
						});
					},

					iPressOnTheDeleteButton : function () {
						return this.waitFor({
							id : "entryList",
							viewName : "Cart",
							matchers : new PropertyStrictEquals({name : "mode", value : "Delete"}),
							success : function (oList) {
								oList.fireDelete({listItem : oList.getItems()[0]});
							},
							errorMessage : "The delete button could not be pressed"
						});
					},

					iPressOnTheAcceptButton : function () {
						return this.waitFor({
							viewName : "Cart",
							controlType : "sap.m.Button",
							matchers : new PropertyStrictEquals({name : "icon", value : "sap-icon://accept"}),
							success : function (aButtons) {
								aButtons[0].$().trigger("tap");
							},
							errorMessage : "The accept button could not be pressed"
						});
					}
				},

				assertions : {

					iShouldSeeTheProductInMyCart : function () {
						return this.waitFor({
							id : "entryList",
							viewName : "Cart",
							matchers : new AggregationFilled({name : "items"}),
							success : function (oList) {
								Opa5.assert.ok(
									oList.getItems().length > 0,
									"The cart has entries"
								);
							},
							errorMessage : "The cart does not contain any entries"
						});
					},

					theEditButtonHelper  : function (bState) {
						var sErrorMessage = "The edit button is enabled";
						var sSuccessMessage = "The edit button is disabled";
						if (bState) {
							sErrorMessage = "The edit button is disabled";
							sSuccessMessage = "The edit button is enabled";
						}
						return this.waitFor({
							controlType : "sap.m.Button",
							matchers : new PropertyStrictEquals({name : "icon", value : "sap-icon://edit"}),
							success : function (aButtons) {
								Opa5.assert.strictEqual(
									aButtons[0].getEnabled(), bState, sSuccessMessage
								);
							},
							errorMessage : sErrorMessage
						});
					},

					theEditButtonShouldBeDisabled : function () {
						return this.theEditButtonHelper(false);
					},

					theEditButtonShouldBeEnabled : function () {
						return this.theEditButtonHelper(true);
					},

					iShouldSeeTheDeleteButton : function () {
						return this.waitFor({
							controlType : "sap.m.List",
							matchers : new PropertyStrictEquals({name : "mode", value : "Delete"}),
							success : function (aLists) {
								Opa5.assert.ok(
									aLists[0],
									"The delete button was found"
								);
							},
							errorMessage : "The delete button was not found"
						});
					},

					iShouldNotSeeTheDeletedItemInTheCart : function () {
						return this.waitFor({
							id : "entryList",
							viewName : "Cart",
							check : function (oList) {
								var bExist =  new AggregationContainsPropertyEqual({
									aggregationName : "items",
									propertyName : "title",
									propertyValue : "Flat S"
								}).isMatching(oList);
								return !bExist;
							},
							success : function (oList) {
								Opa5.assert.strictEqual(
									oList.getItems().length,
									0,
									"The cart does not contain our product"
								);
							},
							errorMessage : "The cart contains our product"
						});
					},

					iShouldBeTakenToTheCart : function () {
						return this.waitFor({
							id : "entryList",
							viewName : "Cart",
							success : function (oList) {
								Opa5.assert.ok(
									oList,
									"The cart was found"
								);
							},
							errorMessage : "The cart was not found"
						});
					}
				}

			}
		});

	}
);
