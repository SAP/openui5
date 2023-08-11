sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function (Opa5, AggregationLengthEquals, PropertyStrictEquals, BindingPath, Press, EnterText) {
	"use strict";

	var sViewName = "App",
		sTableId = "peopleList";

	function getListBinding(oTable) {
		return oTable.getBinding("items");
	}

	function getFirstTableEntry(oTable) {
		return getListBinding(oTable).getCurrentContexts()[0];
	}

	Opa5.createPageObjects({
		onTheTutorialPage : {
			actions : {
				iPressOnMoreData : function () {
					// Press action hits the "more" trigger on a table
					return this.waitFor({
						id : sTableId,
						viewName : sViewName,
						actions : new Press(),
						errorMessage : "Table not found or it does not have a 'See More' trigger"
					});
				},

				iPressOnSort : function () {
					return this.waitFor({
						id : "sortUsersButton",
						viewName : sViewName,
						actions : new Press(),
						errorMessage : "Could not find the 'Sort' button"
					});
				},

				iPressOnAdd : function () {
					return this.waitFor({
						id : "addUserButton",
						viewName : sViewName,
						actions : new Press(),
						errorMessage : "Could not find the 'Add' button"
					});
				},

				iPressOnDelete : function () {
					return this.waitFor({
						id : "deleteUserButton",
						viewName : sViewName,
						actions : new Press(),
						errorMessage : "Could not find the 'Delete' button"
					});
				},

				iPressOnSave : function () {
					return this.waitFor({
						id : "saveButton",
						viewName : sViewName,
						actions : new Press(),
						errorMessage : "Could not find the 'Save' button"
					});
				},

				iPressOnCancel : function () {
					return this.waitFor({
						id : "doneButton",
						viewName : sViewName,
						actions : new Press(),
						errorMessage : "Could not find the 'Cancel' button"
					});
				},

				iEnterSomeData : function (sValue) {
					return this.waitFor({
						controlType : "sap.m.Input",
						viewName : sViewName,
						matchers : [
							// Find the input fields for the new entry
							function (oControl) {
								return oControl.getBindingContext().getIndex() === 0;
							},
							// Keep only empty input fields
							function (oItem) {
								return !oItem.getValue();
							}
						],
						actions : new EnterText({
							text : sValue
						}),
						errorMessage : "Could not find Input controls to enter data"
					});
				},

				iSearchFor : function (sSearchString) {
					return this.waitFor({
						id : "searchField",
						viewName : sViewName,
						actions : new EnterText({
							text : sSearchString
						}),
						errorMessage : "SearchField was not found"
					});
				},

				iSelectUser : function (sKey) {
					return this.waitFor({
						controlType : "sap.m.ColumnListItem",
						viewName : sViewName,
						matchers : new BindingPath({
							path : "/People('" + sKey + "')"
						}),
						actions : function (oItem) {
							oItem.setSelected(true);
						},
						errorMessage : "Could not find a user with the key '" + sKey + "'"
					});
				},

				iChangeAUserKey : function (sOldKey, sNewKey) {
					return this.waitFor({
						controlType : "sap.m.Input",
						viewName : sViewName,
						matchers : new PropertyStrictEquals({
							name : "value",
							value : sOldKey
						}),
						actions : new EnterText({
							text : sNewKey
						}),
						errorMessage : "Could not find a user with the key '" + sOldKey + "'"
					});
				},

				iCloseTheServiceError : function () {
					return this.waitFor({
						id : "serviceErrorMessageBox",
						success : function () {
							this.waitFor({
								controlType : "sap.m.Button",
								searchOpenDialogs : true,
								// The error MessageBox has only one button, which closes the box
								actions : new Press(),
								errorMessage : "Cannot find the 'Close' button"
							});
						},
						errorMessage : "Could not see the service error dialog"
					});
				},

				iPressUser : function () {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : sTableId,
						viewName : sViewName,
						actions : function (oTable) {
							oTable.fireSelectionChange({listItem : oTable.getSelectedItem()});
						},
						errorMessage : "Could not press user"
					});
				}
			},
			assertions : {
				theTableShouldHavePagination : function () {
					return this.waitFor({
						id : sTableId,
						viewName : sViewName,
						matchers : new PropertyStrictEquals({
							name : "growing",
							value : true
						}),
						success : function () {
							Opa5.assert.ok(true, "The table is paginated");
						},
						errorMessage : "Table not found or it is not paginated"
					});
				},

				theTableShouldShowUsers : function (iNumber) {
					return this.waitFor({
						id : sTableId,
						viewName : sViewName,
						matchers : new AggregationLengthEquals({
							name : "items",
							length : iNumber
						}),
						success : function () {
							Opa5.assert.ok(true, "The table has "
								+ iNumber + " items");
						},
						errorMessage : "Table not found or it does not have "
							+ iNumber + " entries"
					});
				},

				theTableShouldShowTotalUsers : function (iNumber) {
					return this.waitFor({
						id : sTableId,
						viewName : sViewName,
						matchers : function (oTable) {
							var oListBinding = getListBinding(oTable);

							return oListBinding && oListBinding.getLength() === iNumber;
						},
						success : function () {
							Opa5.assert.ok(true, "The table shows a total of " + iNumber
								+ " users");
						},
						errorMessage : "Table not found or it does not show " + iNumber
							+ " total users"
					});
				},

				theTableShouldStartWith : function (sLastName) {
					return this.waitFor({
						id : sTableId,
						viewName : sViewName,
						matchers : function (oTable) {
							var oFirstItem = getFirstTableEntry(oTable);

							return oFirstItem && oFirstItem.getProperty("LastName") === sLastName;
						},
						success : function () {
							Opa5.assert.ok(true, "The table is sorted correctly");
						},
						errorMessage : "Table not found or it is not sorted correctl."
					});
				},

				thePageFooterShouldBeVisible : function (bVisible) {
					var sDesiredState = bVisible ? "visible" : "invisible";

					return this.waitFor({
						controlType : "sap.m.Toolbar",
						viewName : sViewName,
						visible : false,
						matchers : new PropertyStrictEquals({
							name : "visible",
							value : bVisible
						}),
						success : function () {
							Opa5.assert.ok(true, "The toolbar is " + sDesiredState);
						},
						errorMessage : "Toolbar not found or is not " + sDesiredState
					});
				},

				theTableToolbarItemsShouldBeEnabled : function (bEnabled) {
					var sDesiredState = bEnabled ? "enabled" : "disabled";

					return this.waitFor({
						id : /searchField$|refreshUsersButton$|sortUsersButton$/,
						viewName : sViewName,
						autoWait : false, // Needed because we want to find disabled controls, too
						matchers : new PropertyStrictEquals({
							name : "enabled",
							value : bEnabled
						}),
						check : function (aControls) {
							// Validate that ALL controls have the right state
							return aControls.length === 3;
						},
						success : function () {
							Opa5.assert.ok(true, "All controls in the table toolbar are "
								+ sDesiredState);
						},
						errorMessage : "Not all controls in the table toolbar could be found or not"
							+ " all are " + sDesiredState
					});
				},

				theMessageToastShouldShow : function (sTextId, sArg0) {
					return this.waitFor({
						autoWait : false,
						id : sTableId,
						viewName : sViewName,
						check : function (oControl) {
							// Locate the message toast using its CSS class name and content
							var sText = oControl.getModel("i18n").getResourceBundle()
									.getText(sTextId, [sArg0]),
								sSelector = ".sapMMessageToast:contains('" + sText + "')";

							return !!Opa5.getJQuery()(sSelector).length;
						},
						success : function () {
							Opa5.assert.ok(true, "Could see the MessageToast showing text with ID "
								+ sTextId);
						},
						errorMessage : "Could not see a MessageToast showing text with ID "
							+ sTextId
					});
				},

				iShouldSeeAServiceError : function () {
					return this.waitFor({
						id : "serviceErrorMessageBox",
						success : function () {
							Opa5.assert.ok(true, "Could see the service error dialog");
						},
						errorMessage : "Could not see the service error dialog"
					});
				},

				theDetailAreaShouldBeVisible : function (bVisible) {
					var sDesiredState = bVisible ? "visible" : "invisible";

					return this.waitFor({
						controlType : "sap.f.semantic.SemanticPage",
						viewName : sViewName,
						visible : false,
						matchers : new PropertyStrictEquals({
							name : "visible",
							value : bVisible
						}),
						success : function () {
							Opa5.assert.ok(true, "The detail area is " + sDesiredState);
						},
						errorMessage : "Detail area not found or is not " + sDesiredState
					});
				}
			}
		}
	});
});
