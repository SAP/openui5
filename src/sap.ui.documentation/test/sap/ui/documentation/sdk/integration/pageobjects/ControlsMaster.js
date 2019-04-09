sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/documentation/sdk/test/pageobjects/util/sortUtil',
	'sap/ui/documentation/sdk/test/pageobjects/matchers'
], function (Opa5, PropertyStrictEquals, sortCheck, matchers) {
	"use strict";

	var sListId = "exploredMasterList";

	Opa5.createPageObjects({
		onTheControlsMasterPage: {
			viewName: "ControlsMaster",
			actions: {
				iGroupByCategoryDescending: function () {
					this.iPressOnSettings();
					this.iPressOnGroupInTheViewSettingsDialog();
					this.iChooseDescendingInTheViewSettingsDialog();
					this.iPressOnCategoryInTheViewSettingsDialog();
					this.iPressOkInTheViewSettingsDialog();
				},

				iPressOnSettings: function () {
					return this.waitFor({
						id: "listFilterSettings",
						success: function (oButton) {
							oButton.$().trigger("tap");
						},
						errorMessage: "The settings buttons was not found"
					});
				},

				iPressOnGroupInTheViewSettingsDialog: function () {
					return this.waitFor({
						id: "viewSettingsDialog",
						success: function (oViewSettingsDialog) {
							// workaround for view settings dialog bug getDomref is not working
							var sId = oViewSettingsDialog.getId();
							Opa5.getJQuery()("#" + sId + "-groupbutton").trigger("tap");
						},
						errorMessage: "The settings buttons was not found"
					});
				},

				iChooseDescendingInTheViewSettingsDialog: function () {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: [
							new PropertyStrictEquals({
								name: "Title",
								value: "Descending"
							})
						],
						success: function (aListItems) {
							aListItems[0].$().trigger("tap");
						},
						errorMessage: "The view settings dialogs descending list item was not found"
					});
				},

				iPressOnCategoryInTheViewSettingsDialog: function () {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: [
							new PropertyStrictEquals({
								name: "Title",
								value: "Category"
							})
						],
						success: function (aListItems) {
							aListItems[0].$().trigger("tap");
						},
						errorMessage: "The view settings dialogs category list item was not found"
					});
				},

				iPressOkInTheViewSettingsDialog : function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new PropertyStrictEquals({
								name: "Text",
								value: "OK"
							})
						],
						success: function (aListItems) {
							aListItems[0].$().trigger("tap");
						},
						errorMessage: "The view settings dialogs ok button was not found"
					});
				},

				iTriggerTheSearchFor : function (sSearchTerm) {
					return this.waitFor({
						id: "searchField",
						success: function (oSearchField) {
							oSearchField.setValue(sSearchTerm);

							/*eslint-disable new-cap */
							var oEvent = jQuery.Event("touchend");
							/*eslint-enable new-cap */
							oEvent.originalEvent = {newValue: sSearchTerm, id: oSearchField.getId()};
							oEvent.target = oSearchField;
							oEvent.srcElement = oSearchField;
							jQuery.extend(oEvent, oEvent.originalEvent);

							oSearchField.fireLiveChange(oEvent);
						}
					});
				},

				iPressOnTheEntity : function (sEntityName) {
					return this.waitFor({
						id : sListId,
						matchers: matchers.listItemWithTitle(sEntityName),
						success: function (oListItem) {
							oListItem.$().trigger("tap");
						},
						errorMessage: "Did not find the entity " + sEntityName
					});
				}

			},
			assertions: {
				iShouldSeeTheControlsMasterPage: function () {
					return this.waitFor({
						success: function () {
							Opa5.assert.ok(true, "The Controls Master page was successfully displayed");
						},
						errorMessage: "The Controls Master page was not displayed"
					});
				},

				iShouldSeeAGroupCalled : function (sGroupName) {
					return this.waitFor({
						controlType: "sap.m.GroupHeaderListItem",
						matchers: new PropertyStrictEquals({
							name: "title",
							value: sGroupName
						}),
						success: function (aGroupHeaders) {
							Opa5.assert.ok(true, "Found the " + sGroupName + " group header");
						},
						errorMessage: "The list did not contain a group called " + sGroupName
					});
				},

				theListShouldBeSortedAscendingByName: function () {
					return this.waitFor({
						id : sListId,
						check: sortCheck.alphabeticallyInGroups(),
						success: function () {
							Opa5.assert.ok(true, "The List was sorted ascending by name");
						},
						errorMessage:  "The List was not sorted ascending by name"
					});
				},

				theListShouldBeSortedDescendingByCategory: function () {
					return this.waitFor({
						id : sListId,
						check: sortCheck.descendingGroups(),
						success: function () {
							Opa5.assert.ok(true, "The List was sorted descending by name");
						},
						errorMessage:  "The List was not sorted descending by name"
					});
				},

				iShouldNotSeeAnEntityCalled: function (sEntityName) {
					return this.waitFor({
						id : sListId,
						matchers: matchers.listWithItemsButNotThisOne(sEntityName),
						success: function () {
							Opa5.assert.ok(true, "The entity " + sEntityName + " has disappeared");
						},
						errorMessage:  "The entity " + sEntityName + " has not disappeared"
					});
				},

				iShouldSeeAnEntityCalled: function (sEntityName) {
					return this.waitFor({
						id : sListId,
						matchers: matchers.listItemWithTitle(sEntityName),
						success: function () {
							Opa5.assert.ok(true, "Found the entity " + sEntityName);
						},
						errorMessage: "Found no entity with the name " + sEntityName
					});
				}
			}
		}
	});

});
