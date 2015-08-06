sap.ui.define([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'test/page/Common',
		'test/page/matchers',
		'test/page/check/sortCheck'
	],
	function(Opa5, PropertyStrictEquals, Common, matchers, sortCheck) {
		"use strict";
		var sListId = "list",
			sViewName = "master";



		Opa5.createPageObjects({

			onTheMasterPage : {
				baseClass: Common,
				actions : {
					iPressOnTheEntity : function (sEntityName) {
						return this.waitFor({
							id : sListId,
							viewName: sViewName,
							matchers: matchers.listItemWithTitle(sEntityName),
							success: function (oListItem) {
								oListItem.$().trigger("tap");
							},
							errorMessage: "Did not find the entity " + sEntityName
						});
					},

					iTriggerTheSearchFor : function (sSearchTerm) {
						return this.waitFor({
							id: "searchField",
							viewName: sViewName,
							success: function (oSearchField) {
								oSearchField.setValue(sSearchTerm);

								var oEvent = jQuery.Event("touchend");
								oEvent.originalEvent = {query: sSearchTerm, id: oSearchField.getId()};
								oEvent.target = oSearchField;
								oEvent.srcElement = oSearchField;
								jQuery.extend(oEvent, oEvent.originalEvent);

								oSearchField.fireLiveChange(oEvent);
							}
						});
					}
				},
				assertions: {
					theListShouldBeSortedAscendingByName: function () {
						return this.waitFor({
							id : sListId,
							viewName: sViewName,
							check: sortCheck.alphabeticallyInGroups(),
							success: function () {
								QUnit.ok(true, "The List was sorted ascending by name");
							},
							errorMessage:  "The List was not sorted ascending by name"
						});
					},

					theListShouldBeSortedDescendingByCategory: function () {
						return this.waitFor({
							id : sListId,
							viewName: sViewName,
							check: sortCheck.descendingGroups(),
							success: function () {
								QUnit.ok(true, "The List was sorted descending by name");
							},
							errorMessage:  "The List was not sorted descending by name"
						});
					},

					iShouldNotSeeAnEntityCalled: function (sEntityName) {
						return this.waitFor({
							id : sListId,
							viewName: sViewName,
							matchers: matchers.listWithItemsButNotThisOne(sEntityName),
							success: function () {
								QUnit.ok(true, "The entity " + sEntityName + " has disappeared");
							},
							errorMessage:  "The entity " + sEntityName + " has not disappeared"
						});
					},

					iShouldSeeAnEntityCalled: function (sEntityName) {
						return this.waitFor({
							id : sListId,
							viewName: sViewName,
							matchers: matchers.listItemWithTitle(sEntityName),
							success: function () {
								QUnit.ok(true, "Found the entity " + sEntityName);
							},
							errorMessage: "Found no entity with the name " + sEntityName
						});
					},

					iShouldSeeAGroupCalled : function (sGroupName) {
						return this.waitFor({
							controlType: "sap.m.GroupHeaderListItem",
							viewName: sViewName,
							matchers: new PropertyStrictEquals({
								name: "title",
								value: sGroupName
							}),
							success: function (aGroupHeaders) {
								QUnit.ok(true, "Found the " + sGroupName + " group header");
							},
							errorMessage: "The list did not contain a group called " + sGroupName
						});
					}
				}
			}

		});

	});
