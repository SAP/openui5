/*** List Report Actions ***/
sap.ui.define(
	["sap/ui/test/matchers/PropertyStrictEquals",
		"sap/ui/test/matchers/AggregationFilled",
		"sap/ui/test/actions/Press",
		"sap/ui/test/matchers/AggregationLengthEquals",
		"sap/ui/test/matchers/Properties",
		"sap/ui/test/actions/EnterText",
		"sap/m/Token"],

	function (PropertyStrictEquals, AggregationFilled, Press, AggregationLengthEquals, Properties, EnterText, Token) {
		"use strict";

		return function () {

			return {
				iClickListItemInViewSettings: function (sColumn) {
					var sortItem = null;
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						check: function (aListItems) {
							for (var i = 0; i < aListItems.length; i++) {
								var sTitle = aListItems[i].getTitle();
								if (sTitle === sColumn) {
									sortItem = aListItems[i];
									return true;
								}
							}
							return false;
						},
						success: function () {
							sortItem.$().trigger("tap");
						},
						errorMessage: "Did not find the " + sColumn + " list item."
					});
				},

				iClickOnColumnHeader : function (sColumn) {
					var oColumnSelectable;
					return this.waitFor({
						controlType: "sap.ui.table.Column",
						check : function (aColumns) {
							for (var i = 0; i < aColumns.length; i++) {
								if (aColumns[i].sId.indexOf(sColumn) !== -1) {
									oColumnSelectable = aColumns[i];
									return true;
								}
							}
							return false;
						},
						success: function () {
							//TODO : explore if any public method is available
							oColumnSelectable._openMenu();
						},
						errorMessage: "The column " + sColumn + "is not available"
					});
				},
				// generic function to select menu items of the column header
				iSelectColumnMenuItem : function (sColumn, sItemText) {
					var oMenuItem;
					return this.waitFor({
						controlType: "sap.ui.table.Column",
						check : function (aColumns) {
							for (var i = 0; i < aColumns.length; i++) {
								// match column and check if open then identify the menu item for selection
								if (aColumns[i].sId.indexOf(sColumn) !== -1 && aColumns[i].getMenu().bOpen) {
									var aMenuItems = aColumns[i].getMenu().getItems();
									for (var j = 0; j < aMenuItems.length; j++) {
										if (aMenuItems[j].getText() === sItemText) {
											oMenuItem = aMenuItems[j];
											return true;
										}
									}
								}
							}
							return false;
						},
						success: function () {
							oMenuItem.fireSelect();
						},
						errorMessage: "The column " + sColumn + "is not available"
					});
				}
			};
		};
	});
