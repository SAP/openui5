sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/test/matchers/AggregationFilled',
		'sap/ui/test/matchers/BindingPath',
		'sap/ui/test/actions/Press'
	], function (Opa5, PropertyStrictEquals, AggregationFilled, BindingPath, Press) {

		Opa5.createPageObjects({
			onTheCategory : {

				actions : {

					iPressOnTheFirstProduct : function () {
						return this.waitFor({
							controlType : "sap.m.ObjectListItem",
							matchers : new BindingPath({path : "/Products('id_11')"}),
							actions : new Press(),
							errorMessage : "The product list does not contain required selection"
						});
					},

					iGoToTheCartPage : function () {
						return this.waitFor({
							viewName : "Category",
							controlType : "sap.m.Button",
							matchers : new PropertyStrictEquals({name : "icon", value : "sap-icon://cart"}),
							actions : new Press(),
							errorMessage : "The cart button was not found and could not be pressed"
						});
					}
				},

				assertions : {

					iShouldSeeTheProductList : function () {
						return this.waitFor({
							id : "productList",
							viewName : "Category",
							success : function (oList) {
								Opa5.assert.ok(
									oList,
									"The product list was found"
								);
							},
							errorMessage : "The product list was not found"
						});
					},

					iShouldBeTakenToTheSecondCategory : function () {
						return this.waitFor({
							viewName : "Category",
							controlType : "sap.m.Page",
							matchers : new PropertyStrictEquals({name : "title", value : "FS"}),
							success : function (aPage) {
								Opa5.assert.ok(
									aPage,
									"The category page was found"
								);
							},
							errorMessage : "The category page was not found"
						});
					},

					theProductListShouldHaveSomeEntries : function () {
						this.waitFor({
							id : "productList",
							viewName : "Category",
							matchers : new AggregationFilled({name : "items"}),
							success : function (oList) {
								Opa5.assert.ok(
									oList.getItems().length > 0,
									"The product list has entries"
								);
							},
							errorMessage : "The product list does not contain any entries"
						});
					}
				}

			}
		});

	}
);
