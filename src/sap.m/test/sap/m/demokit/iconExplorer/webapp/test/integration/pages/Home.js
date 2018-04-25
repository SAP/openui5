sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText",
	"sap/ui/demo/iconexplorer/controls/TitleLink"
], function(Opa5, Press, EnterText, TitleLink) {
	"use strict";
	var sViewName = "Home";

	Opa5.createPageObjects({
		onTheHomePage: {

			actions: {
				iClickOnTheTNTTitleLink: function () {
					return this.waitFor({
						controlType: TitleLink,
						matchers: function (oControl) {
							return oControl.getCustomData().length &&
								oControl.getCustomData()[0].getValue() === "SAP-icons-TNT";
						},
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "Did not find the SAP icons TNT Title Link"
					});
				},

				iSearchForAnIcon: function(sQuery) {
					return this.waitFor({
						id: "search",
						viewName: sViewName,
						actions:[
							new EnterText({text: sQuery}),
							new Press()
						],
						errorMessage: "Can't find the Input Field"
					});
				},

				iEnterTextIntoSearchField: function() {
					return this.waitFor({
						id: "search",
						viewName : sViewName,
						actions : new EnterText({text: "xxx"}),
						errorMessage : "Can't find the Input Field"
					});
				},


				iSelectASuggestion: function(iWhich) {
					return this.waitFor({
						id: "search-popup-table",
						viewName: sViewName,
						actions: function(oTable) {
							var iVisible = 0;

							var oItems = oTable.getItems();
							for (var i = 0; i < oItems.length; i++){
								if (oItems[i].getVisible()){
									iVisible++;
								}
								if (iVisible === iWhich){
									new Press().executeOn(oItems[i]);
									return;
								}
							}
						},
						errorMessage: "Can't see the Input Field"
					});
				},

				iPressTheClearButton : function () {
					return this.waitFor({
						id:"search-__clearIcon",
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "ClearIcon was not visible and could not be pressed."
					});
				}
			},

			assertions: {
				iShouldSeeSomeFontTiles: function () {
					return this.waitFor({
						controlType: "sap.ui.layout.BlockLayoutCell",
						viewName: sViewName,
						success: function (aResults) {
							Opa5.assert.ok(aResults.length > 3, "Found at least 3 block layout cells");
						},
						errorMessage: "Can't find block layout cells on the home page"
					});
				},

				iShouldNotSeeTheClearIcon : function () {
					return this.waitFor({
						id : "search-__clearIcon",
						viewName: sViewName,
						success : function (oIcon) {
							Opa5.assert.ok(oIcon.$().hasClass("sapMSFR"), "Search icon is invisible"
							);
						},
						errorMessage: "ClearIcon is visible in empty input field"
					});
				},

				theSearchFieldShouldBeEmpty : function () {
					return this.waitFor({
						id: "search",
						viewName: sViewName,
						success : function (oSearchField) {
							Opa5.assert.ok(!oSearchField.getProperty("value"));
						}
					});
				}
			}
		}
	});
});
