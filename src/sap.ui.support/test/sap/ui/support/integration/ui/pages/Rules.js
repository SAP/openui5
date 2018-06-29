sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationFilled",
	'sap/ui/test/actions/Press',
	'sap/ui/test/matchers/PropertyStrictEquals',
	'sap/ui/test/actions/EnterText'
], function (Opa5, AggregationFilled, Press, PropertyStrictEquals, EnterText) {
	"use strict";

	var sTreeTableId = "ruleList",
		sViewName = "Analysis",
		sViewNameSpace = "sap.ui.support.supportRules.ui.views.";

	function isRuleSelectedInModel(oTable, iLibIndex, iRuleIndex) {
		return oTable.getModel().getData().treeModel[iLibIndex].nodes[iRuleIndex].selected;
	}

	function isLibrarySelectedInModel(oTable, iLibIndex) {
		return oTable.getModel().getData().treeModel[iLibIndex].selected;
	}
	function isSelectedInView(oTable, iRowIndex) {
		var oModel = oTable.getBinding().getModel(),
			oContext = oTable.getBinding().getContexts(iRowIndex, 1)[0];
		return oModel.getProperty("selected", oContext);
	}

	function createWaitForRulesSelectedCountMatchExpectedCount (iExpectedRulesCount, sSuccessMessage, sErrorMessage) {
		return {
			id: sTreeTableId,
			matchers: new AggregationFilled({ name: "columns" }),
			viewName: sViewName,
			viewNamespace: sViewNameSpace,
			success: function (oTable) {
				Opa5.assert.strictEqual(oTable.getAggregation("columns")[0].getAggregation("label").getProperty("text"), "Rules (" + iExpectedRulesCount + " selected)", sSuccessMessage);
			},
			errorMessage: sErrorMessage
		};
	}

	function createPressTreeTableButtonElement(sId, sSuccessMessage, sErrorMessage) {
		return {
			viewName: sViewName,
			viewNamespace: sViewNameSpace,
			success: function () {
				document.activeElement.contentDocument.getElementById(sId).click();
				Opa5.assert.ok(true, sSuccessMessage);
			},
			errorMessage: sErrorMessage
		};
	}
	Opa5.createPageObjects({

		onTheRulesPage: {
			actions : {

				iPressOnTreeTableCheckBox: function (sId) {

					return this.waitFor(createPressTreeTableButtonElement(sId, "The parent note button in tree table was pressed", "The parent note button in tree table is not there"));

				},

				iPressSettingsButton: function() {
					return this.waitFor({
						id: "settingsIcon",
						matchers: new PropertyStrictEquals({name:"src", value:"sap-icon://settings"}),
						viewName: "Main",
						viewNamespace: sViewNameSpace,
						actions: new Press(),
						success: function () {
							Opa5.assert.ok(true, "Settings button was pressed");
						},
						errorMessage: "Settings button was not found"
					});
				},

				iPressCheckBoxButton: function(bSelectedState) {
					return this.waitFor({
						id: "persistChB",
						controlType : "sap.m.CheckBox",
						actions: new Press(),
						success: function (oCheckBox) {
							oCheckBox.setSelected(bSelectedState);
							Opa5.assert.ok(true, "Checkbox button was pressed and status enabled is:" + bSelectedState);
						},
						errorMessage: "Settings button was not found"
					});
				},

				iPressTableHeader: function () {
					return this.waitFor({
						id: "__xmlview0--analysis--rulesColumn",
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						actions: new Press(),
						success: function (oColumn) {
							var sColumnHeaderName = oColumn.getAggregation("label").getProperty("text");
							Opa5.assert.ok(sColumnHeaderName.indexOf("Rule") !== -1, "Table header was pressed");
						},
						errorMessage: "Table header was not found"
					});
				},

				iEnterFilterValue: function (sFilteringString) {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuTextFieldItem",
						matchers: new PropertyStrictEquals({name:"label", value:"Filter"}),
						success: function (oMenuTextItem) {
							oMenuTextItem[0].setValue(sFilteringString);
							Opa5.assert.ok(oMenuTextItem[0].getValue() === sFilteringString, "Entered filtering text");
						},
						errorMessage: "Was not able to enter filtering text"
					});
				},

				iFilterColumnOfTable: function () {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuTextFieldItem",
						matchers: new PropertyStrictEquals({name:"label", value:"Filter"}),
						actions: new Press(),
						success: function (oMenuTextItem) {
							var $test =  oMenuTextItem[0].$();
							$test.trigger({ type : 'keyup', key : 'Enter', keyCode:13 });
							Opa5.assert.ok(true, "Filtered by entered word");
						},
						errorMessage: "Was not able to filter by entered word"
					});
				},

				iPressSortAscendingButton: function () {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuItem",
						matchers: new PropertyStrictEquals({name:"icon", value:"sap-icon://sort-descending"}),
						actions: new Press(),
						success: function (oMenuItem) {
							Opa5.assert.ok(true, "Sort ascending was pressed");
						},
						errorMessage: "Was not able to press Sort ascending"
					});
				}
			},
			assertions: {

				iShouldSeeRulesTreeTable: function () {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({ name: "columns" }),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function () {
							Opa5.assert.ok(true, "TreeTable should have rules");
						},
						errorMessage: "No rules in the TreeTable"
					});
				},

				iShouldSeeRulesSelectedCountColumnHeader: function (iExpectedRulesCount) {
					return this.waitFor(createWaitForRulesSelectedCountMatchExpectedCount(iExpectedRulesCount, "'Rules selected' label is there", "Can not find ''Rules selected label"));

				},

				iShouldSeeRulesSelectionStateChanged: function (iExpectedRulesCount, sSuccessMessage, sErrorMessage) {
					return this.waitFor(createWaitForRulesSelectedCountMatchExpectedCount(iExpectedRulesCount, sSuccessMessage, sErrorMessage));

				},

				iShouldSeeRuleDeselectedInView: function(iRuleRowIndex) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({ name: "columns" }),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var bResult = isSelectedInView(oTable, iRuleRowIndex);
							Opa5.assert.ok(!bResult, "Rule is deselected in view");
						},
						errorMessage: "Rule is not deselected in view"
					});
				},

				iShouldSeeLibraryDeselectedInView: function(iLibraryRowIndex) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({ name: "columns" }),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var bResult = isSelectedInView(oTable, iLibraryRowIndex);
							Opa5.assert.ok(!bResult, "Library is deselected in view");
						},
						errorMessage: "Library is not deselected in view"
					});
				},

				iShouldSeeLibraryDeselectedInModel: function (iLibIndex, iRuleIndex) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "columns"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var bResult = isLibrarySelectedInModel(oTable, iLibIndex, iRuleIndex);
							Opa5.assert.ok(!bResult, "Library is deselected in model");
						},
						errorMessage: "Rule is not deselected in Model"
					});
				},

				iShouldSeeRuleDeselectedInModel: function (iLibIndex, iRuleIndex) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "columns"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var bResult = isRuleSelectedInModel(oTable, iLibIndex, iRuleIndex);
							Opa5.assert.ok(!bResult, "Rule is deselected in model");
						},
						errorMessage: "Rule is not deselected in Model"
					});
				},

				iShouldSeeLibrarySelectedInView: function(iLibraryRowIndex) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({ name: "columns" }),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var bResult = isSelectedInView(oTable, iLibraryRowIndex);
							Opa5.assert.ok(bResult, "Library is selected in view");
						},
						errorMessage: "Library is not selected in view"
					});
				},

				iShouldSeeRuleSelectedInView: function(iRuleRowIndex) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({ name: "columns" }),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var bResult = isSelectedInView(oTable, iRuleRowIndex);
							Opa5.assert.ok(bResult, "Rule is selected in view");
						},
						errorMessage: "Rule is not selected in view"
					});
				},


				iShouldSeeLibrarySelectedInModel: function (iLibIndex) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "columns"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var bResult = isLibrarySelectedInModel(oTable, iLibIndex);
							Opa5.assert.ok(bResult, "Library is selected in model");
						},
						errorMessage: "Library is not selected in Model"
					});
				},

				iShouldSeeRuleSelectedInModel: function (iLibIndex, iRuleIndex) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "columns"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var bResult = isRuleSelectedInModel(oTable, iLibIndex, iRuleIndex);
							Opa5.assert.ok(bResult, "Rule is selected in model");
						},
						errorMessage: "Rule is not selected in Model"
					});
				},

				iShouldSeeStorageSettingsPopOver: function () {
					return this.waitFor({
						id: "storageSettings",
						controlType : "sap.m.Popover",
						matchers: new PropertyStrictEquals({name:"title", value:"Settings"}),
						success: function () {
							Opa5.assert.ok(true, "Found storage settings popover");
						},
						errorMessage: "Did not find storage settings popover"
					});
				},

				iShouldSeeStorageSettingsCheckBoxSelected: function (bState) {
					return this.waitFor({
						id: "persistChB",
						controlType : "sap.m.CheckBox",
						success: function (oCheckBox) {
							Opa5.assert.ok(oCheckBox.getSelected() === bState, "Persisting settings has been enabled");
						},
						errorMessage: "Persisting settings has not been enabled"
					});
				},

				iShouldSeeColumnListMenu: function () {
					return this.waitFor({
						controlType: sap.ui.table.ColumnMenu,
						success: function () {
							Opa5.assert.ok(document.activeElement.contentDocument.activeElement.getAttribute("id") === "__xmlview0--analysis--rulesColumn-menu", "Column list menu is opened");
						},
						errorMessage: "Column list menu was not found"
					});
				},

				iShouldSeeFilterTextEnteredInFilterField: function (sFilterValue) {
					return this.waitFor({
						controlType: "sap.ui.unified.MenuTextFieldItem",
						success: function (oMenuTextFieldItem) {
							Opa5.assert.ok(oMenuTextFieldItem[0].getValue() === sFilterValue, "filter was applied on column rules with keyword" + sFilterValue);
						},
						errorMessage: "Was not able to filter by: " + sFilterValue
					});
				}
			}

		}

	});

});