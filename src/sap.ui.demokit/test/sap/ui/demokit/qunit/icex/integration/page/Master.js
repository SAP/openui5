sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/matchers/I18NText',
	'test/page/Common',
	'sap/ui/test/actions/Press',
	'sap/ui/test/actions/EnterText'
], function(Opa5, PropertyStrictEquals, I18NText, Common, Press, EnterText) {
	"use strict";

	Opa5.createPageObjects({
		onTheMaster : {
			baseClass: Common,
			actions : {
				iPressTheLevel1Item : function (sTitle) {
					return this.waitFor({
						viewName: "Master",
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({ name: "title",	value: sTitle }),
						errorMessage: "Failed to press level 1 list item with title " + sTitle,
						actions: new Press()
					});
				},
				iPressTheLevel2Item : function (sTitle) {
					return this.waitFor({
						viewName: "Group",
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({ name: "title",	value: sTitle }),
						errorMessage: "Failed to press level 2 list item with title " + sTitle,
						actions: new Press()
					});
				},
				iSearchFor : function (sSearchTerm) {
					return this.waitFor({
						viewName: "Master",
						id: "search",
						errorMessage: "Failed to search for " + sSearchTerm,
						actions: [ new EnterText({ text: sSearchTerm }) ]
					});
				},
				iOpenTheFavoritesFromACategory : function () {
					return this.waitFor({
						viewName: "Group",
						id: "openFavorites",
						controlType: "sap.m.Button",
						errorMessage: "Failed to press the open favorites button",
						actions: new Press()
					});
				},
				iEditTheFavorites : function () {
					return this.waitFor({
						viewName: "Favorite",
						id: "editFavorites",
						controlType: "sap.m.Button",
						errorMessage: "Failed to press the edit favorites button",
						actions: new Press()
					});
				},
				iDeleteTheFavorite : function (sTitle) {
					return this.waitFor({
						viewName: "Favorite",
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({ name: "title",	value: sTitle }),
						errorMessage: "The list did not contain an item called " + sTitle,
						actions: new Press({ idSuffix : "imgDel" })
					});
				},
				iEndEditingTheFavorites : function () {
					return this.waitFor({
						viewName: "Favorite",
						id: "endEditFavorites",
						controlType: "sap.m.Button",
						errorMessage: "Failed to press the end edit favorites button",
						actions: new Press()
					});
				}
			},
			assertions: {
				iShallSeeTheLevel1Item : function (sTitle) {
					return this.waitFor({
						viewName: "Master",
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({ name: "title",	value: sTitle }),
						errorMessage: "The list did not contain an item called " + sTitle,
						success: function () {
							Opa5.assert.ok(true, "Found a " + sTitle + " list item");
						}
					});
				},
				iShallOnlySeeTheLevel1Item : function (sTitle) {
					return this.waitFor({
						viewName: "Master",
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({ name: "title",	value: sTitle }),
						errorMessage: "The list did not contain an item called " + sTitle,
						success: function (aListItems) {
							Opa5.assert.strictEqual(1, aListItems.length, "There is only 1 list item with title " + sTitle);
						}
					});
				},
				iShallSeeTheLevel2Item : function (sTitle) {
					return this.waitFor({
						viewName: "Group",
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({ name: "title",	value: sTitle }),
						errorMessage: "The list did not contain an item called " + sTitle,
						success: function () {
							Opa5.assert.ok(true, "Found a " + sTitle + " list item");
						}
					});
				},
				iShallSeeTheFavoriteItem : function (sTitle) {
					return this.waitFor({
						viewName: "Favorite",
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({ name: "title",	value: sTitle }),
						errorMessage: "The list did not contain an item called " + sTitle,
						success: function () {
							Opa5.assert.ok(true, "Found a " + sTitle + " list item");
						}
					});
				},
				iShallSeeNoFavoriteItems : function () {
					return this.waitFor({
						viewName: "Favorite",
						controlType: "sap.m.List",
						errorMessage: "Did not find list",
						success: function (aList) {
							Opa5.assert.strictEqual(aList[0].getItems().length, 0, "Found no favorite items");
						}
					});
				},
				iShallSeeTheCorrectNumberOfFavorites : function (iCount) {
					return this.waitFor({
						viewName: "Favorite",
						controlType: "sap.m.Page",
						matchers: new I18NText({
							propertyName: "title",
							key: "favoritesPageTitle",
							parameters: [ iCount ]
						}),
						errorMessage: "The favorites page title does not indicate " + iCount + " favorites",
						success: function (aListItems) {
							Opa5.assert.ok(true, "The favorites page title indicates " + iCount + " favorites");
						}
					});
				}
			}
		}
	});
});