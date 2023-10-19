sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/EnterText"
], function (Opa5, AggregationFilled, Press, PropertyStrictEquals, EnterText) {
	"use strict";

	var sTreeTableId = "ruleList",
		sViewName = "Analysis",
		sViewNameSpace = "sap.ui.support.supportRules.ui.views.";

	function isRuleSelectedInModel(oTable, iLibIndex, iRuleIndex) {
		return oTable.getModel("ruleSets").getData()[iLibIndex].nodes[iRuleIndex].selected;
	}

	function isLibrarySelectedInModel(oTable, iLibIndex) {
		return oTable.getModel("ruleSets").getData()[iLibIndex].selected;
	}

	function isSelectedInView(oTable, iRowIndex) {
		var oModel = oTable.getBinding().getModel(),
			oContext = oTable.getBinding().getContexts(iRowIndex, 1)[0];
		return oModel.getProperty("selected", oContext);
	}

	function countRulesInLibraryFromModel(oTable, iLibIndex) {
		return oTable.getModel("ruleSets").getData()[iLibIndex].nodes.length;
	}

	function getSpecificRuleTitle(oTable, iLibIndex, iRuleIndex) {
		return oTable.getModel("ruleSets").getData()[iLibIndex].nodes[iRuleIndex].title;
	}

	function getRowElements(oTable, sTitle) {
		var $oTitle = oTable.$().find("span").filter(function() {
				return (Opa5.getJQuery()(this).text() === sTitle);
			}),
			sRowId = $oTitle.parents("tr").attr("id"),
			$oRow = oTable.$().find("[data-sap-ui-related='" + sRowId + "']"),
			oCheckbox = $oRow[0].firstChild,
			oCopyIcon = $oRow.find("[title='Copy']")[0],
			oDeleteIcon = $oRow.find("[title='Delete']")[0],
			oEditIcon = $oRow.find("[title='Edit']")[0],
			expandCollapse = $oTitle.siblings()[0],
			bSelected = Opa5.getJQuery()($oRow[0]).hasClass("sapUiTableRowSel");

		return {
			checkbox: oCheckbox,
			copyIcon: oCopyIcon,
			deleteIcon: oDeleteIcon,
			editIcon: oEditIcon,
			expandCollapse: expandCollapse,
			isSelected: bSelected
		};
	}

	function createWaitForRulesSelectedCountMatchExpectedCount (iExpectedRulesCount, sSuccessMessage, sErrorMessage) {
		var sLabelValue = "Rules (" + iExpectedRulesCount + " selected)";
		return {
			controlType: "sap.m.Label",
			matchers: new PropertyStrictEquals({name:"text", value:sLabelValue}),
			viewName: sViewName,
			viewNamespace: sViewNameSpace,
			success: function (oColumn) {
				Opa5.assert.strictEqual(oColumn[0].getProperty("text") , sLabelValue, sSuccessMessage);
			},
			errorMessage: sErrorMessage
		};
	}

	Opa5.createPageObjects({

		onTheRulesPage: {
			actions : {

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
							Opa5.assert.ok(true, "Checkbox button was pressed and status checked is: " + bSelectedState);
						},
						errorMessage: "Settings button was not found"
					});
				},

				iPressDeleteButton: function() {
					return this.waitFor({
						viewName: "Main",
						viewNamespace: sViewNameSpace,
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({name:"text", value:"Delete Persisted Data"}),
						actions: new Press(),
						success: function () {
							Opa5.assert.ok(true, "Delete button was pressed");
						},
						errorMessage: "Delete button was not found"
					});
				},

				iPressTableHeader: function () {
					return this.waitFor({
						id: "rulesColumn",
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
						id: "tableColumnMenu",
						success: function (oMenu) {
							this.waitFor({
								controlType: "sap.m.Input",
								matchers: {
									ancestor: oMenu
								},
								actions: new EnterText({
									text: sFilteringString
								}),
								errorMessage: "Was not able to find input element or enter filtering text"
							});
						},
						errorMessage: "Column list menu was not found"
					});
				},

				iFilterColumnOfTable: function () {
					return this.waitFor({
						id: "tableColumnMenu",
						success: function (oMenu) {
							this.waitFor({
								controlType: "sap.m.Input",
								matchers: {
									ancestor: oMenu
								},
								actions: new Press(),
								errorMessage: "Was not able to filter by entered word"
							});
						},
						errorMessage: "Column list menu was not found"
					});
				},

				iPressSortDescendingButton: function () {
					return this.waitFor({
						id: "tableColumnMenu",
						success: function (oMenu) {
							this.waitFor({
								controlType: "sap.m.Button",
								matchers: {
									ancestor: oMenu,
									properties: {
										text: "Descending"
									}
								},
								actions: new Press(),
								success: function () {
									Opa5.assert.ok(true, "Sort descending was pressed");
								},
								errorMessage: "Was not able to press Sort descending"
							});
						},
						errorMessage: "Column list menu was not found"
					});
				},

				iPressIconTabHeader: function (sValue) {
					return this.waitFor({
						controlType: "sap.m.IconTabFilter",
						matchers: new PropertyStrictEquals({name:"key", value:sValue}),
						actions: new Press(),
						success: function (oIconTabFilter) {
							Opa5.assert.ok(oIconTabFilter[0].getProperty("key") === sValue, "IconTabHeader with value " + sValue + "was pressed");
						},
						errorMessage: "IconTabHeader was not found"
					});
				},

				iPressButtonWithText: function(sTextValue) {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new PropertyStrictEquals({name:"text", value:sTextValue}),
						actions: new Press(),
						success: function () {
							Opa5.assert.ok(true, "Create Rule button was pressed");
						},
						errorMessage: "Create Rule button was not found"
					});
				},

				iSelectAdditionalRuleSet: function (sValue) {
					return this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: new PropertyStrictEquals({ name: "title", value: sValue }),
						actions: new Press(),
						success: function (oStandartListItem) {
							Opa5.assert.ok(oStandartListItem[0].getProperty("title") === sValue, "list item with value " + sValue + "was pressed");
						},
						errorMessage: "List item was not found"
					});
				},

				iPressLoadAdditionalRuleSetButton: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({ name: "text", value: "Load" }),
						actions: new Press(),
						success: function (oButton) {
							Opa5.assert.ok(oButton[0].getProperty("text") === "Load", "Button 'Load' was pressed");
						},
						errorMessage: "Button was not pressed"
					});
				},

				iClickRow: function (sName) {
					return this.waitFor({
						controlType: "sap.m.Text",
						matchers: new PropertyStrictEquals({ name: "text", value: sName }),
						actions: new Press(),
						success: function () {
							Opa5.assert.ok(true, "Row " + sName + " was pressed.");
						},
						errorMessage: "The row was not pressed"
					});
				},
				iPressSelectAllCheckbox: function () {
					return this.waitFor({
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						id: "ruleList",
						actions: new Press({idSuffix: "selall"}),
						success: function () {
							Opa5.assert.ok(true, "Select all checkbox was pressed");
						},
						errorMessage: "Select all checkbox was not found"
					});
				},
				// works both for rules and rule sets
				iPressSelectCheckboxOf: function (sTitle, sSuccessMessage, sErrorMessage) {
					return this.waitFor({
						id: sTreeTableId,
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						matchers: new AggregationFilled({name: "columns"}),
						success: function (oTable) {
							var oRowElements = getRowElements(oTable, sTitle);
							Opa5.getJQuery()(oRowElements.checkbox).trigger("tap");
							Opa5.assert.ok(true, sSuccessMessage);
						},
						errorMessage: sErrorMessage
					});
				},
				iPressCloneIconOfRule: function (sTitle) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "columns"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var oRowElements = getRowElements(oTable, sTitle);
							oRowElements.copyIcon.click();
							Opa5.assert.ok(true, "Clone Icon of Rule with title " + sTitle + " was pressed");
						},
						errorMessage: "Clone icon was not found"
					});
				},
				iPressDeleteIconOfTemporaryRule: function (sTitle) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "columns"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var oRowElements = getRowElements(oTable, sTitle);
							oRowElements.deleteIcon.click();
							Opa5.assert.ok(true, "Delete icon of " + sTitle + " was pressed");
						},
						errorMessage: "Delete Rule icon was not found"
					});
				},
				iPressEditIconOfTemporaryRule: function (sTitle) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "columns"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var oRowElements = getRowElements(oTable, sTitle);
							oRowElements.editIcon.click();
							Opa5.assert.ok(true, "Edit icon of " + sTitle + " was pressed");
						},
						errorMessage: "Edit Rule icon was not found"
					});
				},
				iPressExpandCollapseButtonOfRuleSet: function (sTitle, sSuccessMessage, sErrorMessage) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "columns"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var oRowElements = getRowElements(oTable, sTitle);
							oRowElements.expandCollapse.click();
							Opa5.assert.ok(true, sSuccessMessage);
						},
						errorMessage: sErrorMessage
					});
				},
				iPressAnalyze: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({name: "text", value: "Analyze"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						actions: new Press(),
						success: function () {
							Opa5.assert.ok(true, "'Analyze' button was pressed.");
						},
						errorMessage: "Could NOT find 'Analyze' button."
					});
				},
				iDeselectAllRules: function () {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "columns"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							oTable.removeSelectionInterval(0, 100); // deselects up to 100 rules
							Opa5.assert.ok(true, "All rules were deselected");
						},
						errorMessage: "Could NOT find rules table"
					});
				}
			},
			assertions: {

				iShouldSeeRulesTreeTable: function () {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({ name: "rows" }),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function () {
							Opa5.assert.ok(true, "TreeTable should have rules");
						},
						errorMessage: "No rules in the TreeTable"
					});
				},

				iShouldSeeVisibleRuleDetailsPage: function () {
					return this.waitFor({
						id: "ruleDetailsPage",
						success: function (oPage) {
							Opa5.assert.ok(oPage.getVisible(), "Rule details page should be visible.");
						},
						errorMessage: "Rule details page is not visible."
					});
				},

				iShouldSeeHiddenRuleDetailsPage: function () {
					return this.waitFor({
						autoWait: false,
						check: function () {
							return Opa5.getJQuery()("#sap-ui-invisible-ruleDetailsPage").length > 0;
						},
						success: function () {
							Opa5.assert.ok(true, "Rule details page should be hidden.");
						},
						errorMessage: "Rule details page is not hidden."
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
						check: function (oTable) {
							return !isSelectedInView(oTable, iRuleRowIndex);
						},
						success: function () {
							Opa5.assert.ok(true, "Rule is deselected in view");
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
						check: function (oTable) {
							return !isSelectedInView(oTable, iLibraryRowIndex);
						},
						success: function () {
							Opa5.assert.ok(true, "Library is deselected in view");
						},
						errorMessage: "Library with index " + iLibraryRowIndex + " is not deselected in view"
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
						errorMessage: "Library is not deselected in Model"
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
						check: function (oTable) {
							return isSelectedInView(oTable, iLibraryRowIndex);
						},
						success: function () {
							Opa5.assert.ok(true, "Library is selected in view");
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
						check: function (oTable) {
							return isSelectedInView(oTable, iRuleRowIndex);
						},
						success: function () {
							Opa5.assert.ok(true, "Rule is selected in view");
						},
						errorMessage: "Rule is not selected in view"
					});
				},

				iShouldSeeDuplicatedRuleSelectedInView: function (sTitle) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({ name: "columns" }),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var oRowElements = getRowElements(oTable, sTitle);
							Opa5.assert.ok(oRowElements.isSelected, "Rule is selected in view");
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
							Opa5.assert.ok(oCheckBox.getSelected() === bState, "Persisting settings has status " + bState);
						},
						errorMessage: "Persisting settings does not have status " + bState
					});
				},

				iShouldSeeColumnListMenu: function () {
					return this.waitFor({
						id: "tableColumnMenu",
						check: function (oMenu) {
							var oActiveElement = document.activeElement.contentDocument.activeElement;

							return oMenu.getDomRef().contains(oActiveElement);
						},
						success: function () {
							Opa5.assert.ok(true, "Column list menu is opened and focus is applied in it");
						},
						errorMessage: "Column list menu was not found"
					});
				},

				iShouldSeeFilterTextEnteredInFilterField: function (sFilterValue) {
					return this.waitFor({
						id: "tableColumnMenu",
						success: function (oMenu) {
							this.waitFor({
								controlType: "sap.m.Input",
								matchers: {
									ancestor: oMenu,
									properties: {
										value: sFilterValue
									}
								},
								success: function () {
									Opa5.assert.ok(true, "filter was applied on column rules with keyword" + sFilterValue);
								},
								errorMessage: "Was not able to filter by: " + sFilterValue
							});
						},
						errorMessage: "Column list menu was not found"
					});
				},

				iShouldSeeNumberOfRulesInLibrary: function (iLibIndex, iExpectedCount) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "rows"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						check: function (oTable) {
							var iCountOfRules = countRulesInLibraryFromModel(oTable, iLibIndex);
							return iCountOfRules === iExpectedCount;
						},
						success: function () {
							Opa5.assert.ok(true, "Count of rules inside the library is " + iExpectedCount);
						},
						errorMessage: "Count of rules is incorrect"
					});
				},
				iShouldSeeARuleWithSpecificTitle: function (iLibIndex, iRuleIndex, sRuleTitle) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "columns"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							var sTitle = getSpecificRuleTitle(oTable, iLibIndex, iRuleIndex);
							Opa5.assert.ok(sRuleTitle === sTitle, "A rule with this title " + sTitle + " was found");
						},
						errorMessage: "A rule with this title was not found"
					});
				},

				iShouldSeeRuleInTable: function (sRuleTitle, sErrorMessage) {
					return this.waitFor({
						id: sTreeTableId,
						matchers: new AggregationFilled({name: "columns"}),
						viewName: sViewName,
						viewNamespace: sViewNameSpace,
						success: function (oTable) {
							this.waitFor({
								controlType: "sap.m.Text",
								matchers: {
									ancestor: oTable,
									properties: {
										text: sRuleTitle
									}
								},
								success: function () {
									Opa5.assert.ok(true, "Rule with title '" + sRuleTitle + "' was found");
								},
								errorMessage: sErrorMessage
							});
						},
						errorMessage: "The tree table wasn't found"
					});
				}
			}

		}

	});

});