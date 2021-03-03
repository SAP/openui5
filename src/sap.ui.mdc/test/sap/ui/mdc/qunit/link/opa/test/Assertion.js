/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5", "sap/ui/core/library", "sap/ui/core/format/DateFormat", "test-resources/sap/ui/mdc/qunit/link/opa/test/Util", "sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5, coreLibrary, DateFormat, TestUtil, PropertyStrictEquals) {
	"use strict";
	var Assertion = Opa5.extend("sap.ui.mdc.qunit.link.opa.test.Assertion", {
		isTabSelected: function(oSegmentedButton, sTabName) {
			if (!oSegmentedButton || sTabName === "") {
				return false;
			}
			var sSelectedButtonID = oSegmentedButton.getSelectedButton();
			var oSelectedButton = TestUtil.getNavigationItem(oSegmentedButton, sTabName);
			return sSelectedButtonID === oSelectedButton.getId();
		},
		/**
		 * Returns NavigationItem
		 * @param {sap.m.SegmentedButton || sap.m.List} oNavigationControl
		 * @param {string} sPanelName
		 * @returns NavigationItem
		 */
		getNavigationItem: function(oNavigationControl, sPanelName) {
			if (!oNavigationControl || sPanelName === "") {
				return null;
			}
			var oNavigationItem = null;
			if (sap.ui.Device.system.phone) {
				oNavigationControl.getItems().some(function(oNavigationItem_) {
					if (oNavigationItem_.getTitle() === sPanelName) {
						oNavigationItem = oNavigationItem_;
						return true;
					}
				});
			} else {
				oNavigationControl.getButtons().some(function(oNavigationItem_) {
					if (oNavigationItem_.getText() === sPanelName) {
						oNavigationItem = oNavigationItem_;
						return true;
					}
				});
			}
			return oNavigationItem;
		},
		iShouldSeePersonalizationButton: function(sControlType) {
			sControlType = sControlType || "sap.m.OverflowToolbarButton";
			return this.waitFor({
				controlType: sControlType,
				viewName: "Main",
				matchers: new sap.ui.test.matchers.PropertyStrictEquals({
					name: "icon",
					value: "sap-icon://action-settings"
				}),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "One button found");
					Opa5.assert.equal(aButtons[0].getIcon(), "sap-icon://action-settings", "The personalization button found");
				}
			});
		},
		thePersonalizationDialogOpens: function() {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				check: function(aSelectionDialogs) {
					return aSelectionDialogs.length > 0;
				},
				success: function(aSelectionDialogs) {
					// aP13nDialogs[0].setShowResetEnabled(true); // workaround because changing filter selection (Action.iChangeFilterSelectionToDate())
					// does not trigger enabling of "Restore" button
					Opa5.assert.ok(aSelectionDialogs.length, 'Personalization Dialog should be open');
				}
			});
		},
		thePersonalizationDialogShouldBeClosed: function() {
			var aDomDialogs;
			return this.waitFor({
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnDialog = frameJQuery.sap.getObject('sap.m.Dialog');
					aDomDialogs = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnDialog);
					return !aDomDialogs.length;
				},
				success: function() {
					Opa5.assert.ok(!aDomDialogs.length, "The personalization dialog is closed");
				},
				timeout: 5
			});
		},
		iShouldSeeNavigationControl: function() {
			if (sap.ui.Device.system.phone) {
				return this.waitFor({
					controlType: "sap.m.List",
					success: function(aLists) {
						Opa5.assert.ok(aLists.length === 1, "List should appear");
					},
					errorMessage: "sap.m.List not found"
				});
			}
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.SegmentedButton",
				success: function(aSegmentedButtons) {
					Opa5.assert.ok(aSegmentedButtons.length === 1, "Segmented Button should appear");
				},
				errorMessage: "sap.m.SegmentedButton not found"
			});
		},
		iShouldSeeNavigationControlWithPanels: function(iNumberOfPanels) {
			if (sap.ui.Device.system.phone) {
				return this.waitFor({
					controlType: "sap.m.List",
					success: function(aLists) {
						Opa5.assert.ok(aLists[0].getItems().length === iNumberOfPanels, "List with " + iNumberOfPanels + " lines should appear");
					}
				});
			}
			return this.waitFor({
				controlType: "sap.m.SegmentedButton",
				success: function(aSegmentedButtons) {
					Opa5.assert.ok(aSegmentedButtons[0].getButtons().length === iNumberOfPanels, "Segmented Button with " + iNumberOfPanels + " tabs should appear");
				}
			});
		},
		iShouldSeePanelsInOrder: function(aOrderedPanelNames) {
			if (sap.ui.Device.system.phone) {
				return this.waitFor({
					controlType: "sap.m.List",
					success: function(aLists) {
						Opa5.assert.ok(aLists[0].getItems());
					}
				});
			}
			return this.waitFor({
				controlType: "sap.m.SegmentedButton",
				success: function(aSegmentedButtons) {
					aOrderedPanelNames.forEach(function(sPanelType, iIndex) {
						var sTabText = aSegmentedButtons[0].getButtons()[iIndex].getText();
						var sText = TestUtil.getTextOfPanel(sPanelType);
						Opa5.assert.ok(sTabText === sText, (iIndex + 1) + ". tab should be " + sPanelType);
					});
				}
			});
		},
		iShouldSeeSelectedTab: function(sPanelType) {
			// On desktop we can check if the tap is selected. On phone we do not have SegmentedButtons on the top of panel.
			if (sap.ui.Device.system.phone) {
				return;
			}
			return this.waitFor({
				controlType: "sap.m.SegmentedButton",
				success: function(aSegmentedButtons) {
					Opa5.assert.ok(this.isTabSelected(aSegmentedButtons[0], TestUtil.getTextOfPanel(sPanelType)), "The '" + sPanelType + "' tab is selected");
				}
			});
		},
		iShouldSeePanel: function(sPanelType) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: TestUtil.getControlTypeOfPanel(sPanelType),
				success: function(aPanels) {
					Opa5.assert.ok(aPanels[0].getVisible(), "The '" + sPanelType + "' tab is visible");
				}
			});
		},
		iShouldSeeTheCheckboxSelectAllSwitchedOn: function(bIsSwitchedOn) {
			var oSelectAllCheckbox;
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.CheckBox",
				check: function(aCheckboxes) {
					return aCheckboxes.filter(function(oCheckbox) {
						if (oCheckbox.getId().endsWith("-sa")) {
							oSelectAllCheckbox = oCheckbox;
							return true;
						}
						return false;
					});
				},
				success: function() {
					Opa5.assert.ok(oSelectAllCheckbox.getSelected() === bIsSwitchedOn);
				}
			});
		},
		iShouldSeeTableWithFixedColumnCount: function(iFixedColumnCount) {
			return this.waitFor({
				controlType: "sap.ui.table.Table",
				success: function(aTables) {
					Opa5.assert.equal(aTables.length, 1, "Only one table should be displayed");
					Opa5.assert.equal(aTables[0].getFixedColumnCount(), iFixedColumnCount, "Table has " + iFixedColumnCount + " fixed columns");
				}
			});
		},
		iShouldSeeColumnOfWidth: function(sColumnName, sWidth) {
			var oDomColumn;
			return this.waitFor({
				controlType: "sap.ui.table.Column",
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnDialog = frameJQuery.sap.getObject("sap.ui.table.Column");
					var aDomColumns = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnDialog);
					oDomColumn = aDomColumns[0];
					return oDomColumn && oDomColumn.getWidth() === sWidth;
				},
				success: function() {
					Opa5.assert.ok(oDomColumn, "Column '" + sColumnName + "' is visible");
					Opa5.assert.equal(oDomColumn.getWidth(), sWidth, "Column '" + sColumnName + "' has width of '" + sWidth + "'");
				},
				timeout: 5
			});
		},
		iShouldSeeVisibleColumnsInOrder: function(sColumnType, aOrderedColumnNames) {
			var aDomColumns;
			return this.waitFor({
				controlType: sColumnType,
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnDialog = frameJQuery.sap.getObject(sColumnType);
					aDomColumns = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnDialog);
					return aDomColumns.length === aOrderedColumnNames.length;
				},
				success: function() {
					Opa5.assert.equal(aOrderedColumnNames.length, aDomColumns.length);
					aDomColumns.forEach(function(oColumn, iIndex) {
						var sLabel = oColumn.getMetadata().getName() === "sap.m.Column" ? oColumn.getHeader().getText() : oColumn.getLabel().getText();
						Opa5.assert.equal(sLabel, aOrderedColumnNames[iIndex], "Column '" + aOrderedColumnNames[iIndex] + "' is visible on position " + (iIndex + 1));
					});
				}
			});
		},
		iShouldSeeVisibleDimensionsInOrder: function(aOrderedDimensionNames) {
			var aDomElements;
			return this.waitFor({
				controlType: "sap.chart.Chart",
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnControl = frameJQuery.sap.getObject("sap.chart.Chart");
					aDomElements = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnControl);
					return aDomElements[0].getVisibleDimensions().length === aOrderedDimensionNames.length;
				},
				success: function() {
					Opa5.assert.equal(aDomElements.length, 1, "One sap.chart.Chart control found");
					Opa5.assert.equal(aDomElements[0].getVisibleDimensions().length, aOrderedDimensionNames.length, "Chart contains " + aOrderedDimensionNames.length + " visible dimensions");
					aDomElements[0].getVisibleDimensions().forEach(function(sDimensionName, iIndex) {
						Opa5.assert.equal(sDimensionName, aOrderedDimensionNames[iIndex], "Dimension '" + sDimensionName + "' is visible on position " + (iIndex + 1));
					});
				},
				timeout: 5
			});
		},
		iShouldSeeVisibleMeasuresInOrder: function(aOrderedMeasureNames) {
			var aDomElements;
			return this.waitFor({
				controlType: "sap.chart.Chart",
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnControl = frameJQuery.sap.getObject("sap.chart.Chart");
					aDomElements = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnControl);
					return aDomElements[0].getVisibleMeasures().length === aOrderedMeasureNames.length;
				},
				success: function() {
					Opa5.assert.equal(aDomElements.length, 1, "One sap.chart.Chart control found");
					Opa5.assert.equal(aDomElements[0].getVisibleMeasures().length, aOrderedMeasureNames.length, "Chart contains " + aOrderedMeasureNames.length + " visible measures");
					aDomElements[0].getVisibleMeasures().forEach(function(sMeasureName, iIndex) {
						Opa5.assert.equal(sMeasureName, aOrderedMeasureNames[iIndex], "Measure '" + sMeasureName + "' is visible on position " + (iIndex + 1));
					});
				},
				timeout: 5
			});
		},
		iShouldSeeChartOfType: function(sChartTypeKey) {
			var aDomElements;
			return this.waitFor({
				controlType: "sap.chart.Chart",
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnControl = frameJQuery.sap.getObject("sap.chart.Chart");
					aDomElements = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnControl);
					return aDomElements[0].getChartType() === sChartTypeKey;
				},
				success: function() {
					Opa5.assert.equal(aDomElements.length, 1, "One sap.chart.Chart control found");
					Opa5.assert.equal(aDomElements[0].getChartType(), sChartTypeKey, "The chart type of the Chart is '" + sChartTypeKey + "'");
				},
				timeout: 5
			});
		},
		iShouldSeeComboBoxWithChartType: function(sChartTypeText) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.ComboBox",
				matchers: new sap.ui.test.matchers.PropertyStrictEquals({
					name: "value",
					value: sChartTypeText
				}),
				success: function(aComboBoxes) {
					Opa5.assert.equal(aComboBoxes.length, 1, "One Combobox found");
					Opa5.assert.equal(aComboBoxes[0].getValue(), sChartTypeText, "The Combobox has value equal to chart type '" + sChartTypeText + "'");
				}
			});
		},
		iShouldSeeChartTypeButtonWithIcon: function(sIcon) {
			return this.waitFor({
				controlType: "sap.m.OverflowToolbarButton",
				matchers: new sap.ui.test.matchers.PropertyStrictEquals({
					name: "icon",
					value: sIcon
				}),
				success: function(aOverflowToolbarButtons) {
					Opa5.assert.equal(aOverflowToolbarButtons.length, 1, "One sap.m.OverflowToolbarButton control found");
					Opa5.assert.equal(aOverflowToolbarButtons[0].getIcon(), sIcon, "The chart type icon of the chart type button is '" + sIcon + "'");
				},
				timeout: 5
			});
		},
		theNumberOfSelectedDimeasuresShouldRemainStable: function() {
			return this.waitFor({
				controlType: "sap.chart.Chart",
				success: function(aCharts) {
					var oChart = aCharts[0];
					var aVisibleCols = [];
					oChart.getModel().getServiceAnnotations()["EPM_DEVELOPER_SCENARIO_SRV.Product"]["com.sap.vocabularies.UI.v1.Chart"]["Dimensions"].forEach(function(oItem) {
						aVisibleCols.push(oItem.PropertyPath);
					});
					oChart.getModel().getServiceAnnotations()["EPM_DEVELOPER_SCENARIO_SRV.Product"]["com.sap.vocabularies.UI.v1.Chart"]["Measures"].forEach(function(oItem) {
						aVisibleCols.push(oItem.PropertyPath);
					});
					Opa5.assert.ok((oChart.getVisibleDimensions().length + oChart.getVisibleMeasures().length) === aVisibleCols.length);
				}
			});
		},
		theTableShouldContainColumns: function(sTableType, iNumberColumns) {
			return this.waitFor({
				controlType: sTableType,
				check: function(aTables) {
					return aTables[0].getColumns().length === iNumberColumns;
				},
				success: function(aTables) {
					Opa5.assert.ok(aTables[0].getColumns().length === iNumberColumns, "Table contains " + iNumberColumns + " columns");
				},
				timeout: 5
			});
		},
		iShouldSeeItemWithSelection: function(sItemText, bSelected) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aTables) {
					var aItems = aTables[0].getItems().filter(function(oItem) {
						return oItem.getCells()[0].getText() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0]);
					Opa5.assert.equal(aItems[0].getVisible(), true);
					Opa5.assert.equal(aItems[0].getSelected(), bSelected, sItemText + " is " + (bSelected ? "selected" : "unselected"));
				}
			});
		},
		iShouldSeeLinkItemWithSelection: function(sItemText, bSelected) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aLists) {
					var aItems = aLists[0].getItems().filter(function(oItem) {
						return oItem.getCells()[0].getText() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0].getCells()[0]._getCompositeAggregation().getContent()[0].getItems()[1].getItems()[0].isA("sap.m.Link"), "List item contains sap.m.Link");
					Opa5.assert.equal(aItems[0].getCells()[0]._getCompositeAggregation().getContent()[0].getItems()[1].getItems()[0].getVisible(), true, "sap.m.Link is visible");
					Opa5.assert.equal(aItems[0].getSelected(), bSelected, sItemText + " is " + (bSelected ? "selected" : "unselected"));
				}
			});
		},
		iShouldSeeLinkItemAsEnabled: function(sItemText, bEnabled) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aLists) {
					var aItems = aLists[0].getItems().filter(function(oItem) {
						return oItem.getCells()[0].getText() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0].getCells()[0]._getCompositeAggregation().getContent()[0].getItems()[1].getItems()[0].isA("sap.m.Link"), "List item contains sap.m.Link");
					Opa5.assert.equal(aItems[0].getCells()[0]._getCompositeAggregation().getContent()[0].getItems()[1].getItems()[0].getVisible(), true, "sap.m.Link is visible");
					Opa5.assert.equal(aItems[0].getCells()[0]._getCompositeAggregation().getContent()[0].getItems()[1].getItems()[0].getEnabled(), bEnabled, sItemText + " is " + (bEnabled ? "enable" : "disabled"));
				}
			});
		},
		iShouldSeeItemOnPosition: function(sItemText, iIndex) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aTables) {
					var aItems = aTables[0].getItems().filter(function(oItem) {
						return oItem.getCells()[0].getText() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0]);
					Opa5.assert.equal(aItems[0].getVisible(), true);
					Opa5.assert.equal(aTables[0].getItems().indexOf(aItems[0]), iIndex, sItemText + " is on position " + iIndex);
				}
			});
		},
		iShouldSeeLinkItemOnPosition: function(sItemText, iIndex) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aLists) {
					var aItems = aLists[0].getItems().filter(function(oItem) {
						return oItem.getCells()[0].getText() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0].getCells()[0]._getCompositeAggregation().getContent()[0].getItems()[1].getItems()[0].isA("sap.m.Link"), "List item contains sap.m.Link");
					Opa5.assert.ok(aItems[0].getCells()[0]._getCompositeAggregation().getContent()[0].getItems()[1].getItems()[0], "sap.m.Link exists");
					Opa5.assert.equal(aItems[0].getCells()[0]._getCompositeAggregation().getContent()[0].getItems()[1].getItems()[0].getVisible(), true, "sap.m.Link is visible");
					Opa5.assert.equal(aItems[0].getVisible(), true);
					Opa5.assert.equal(aLists[0].getItems().indexOf(aItems[0]), iIndex, sItemText + " is on position " + iIndex);
				}
			});
		},
		iShouldSeeMarkingOfItem: function(sItemText, bMarked) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function(aTables) {
					var aItems = aTables[0].getItems().filter(function(oItem) {
						return oItem.getCells()[0].getText() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0]);
					Opa5.assert.equal(aItems[0].getVisible(), true);
					var bIsMarked = aItems[0].$().hasClass("sapMP13nColumnsPanelItemSelected");
					Opa5.assert.equal(bIsMarked, bMarked, sItemText + " is " + (bIsMarked ? "" : "not ") + "marked");
				}
			});
		},
		iShouldSeeGroupSelectionWithColumnName: function(sColumnName) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.ComboBox",
				success: function(aComboBoxes) {
					var aComboBox = aComboBoxes.filter(function(oComboBox) {
						return oComboBox.getSelectedItem().getText() === sColumnName;
					});
					Opa5.assert.equal(aComboBox.length, 1, "Combobox with selected column '" + sColumnName + "' is found");
				}
			});
		},
		iShouldSeeGroupSelectionOnPosition: function(sColumnName, iIndex) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.ComboBox",
				success: function(aComboBoxes) {
					var aComboBox = aComboBoxes.filter(function(oComboBox) {
						return oComboBox.getSelectedItem().getText() === sColumnName;
					});
					Opa5.assert.equal(aComboBox.length, 1, "Combobox with selected column '" + sColumnName + "' is found");
					Opa5.assert.equal(aComboBoxes.indexOf(aComboBox[0]), iIndex, "Combobox with selected column '" + sColumnName + "' is on position " + iIndex);
				}
			});
		},
		iShouldSeeGroupSelectionWithCheckedShowFieldAsColumn: function(bChecked) {
			return this.waitFor({
				controlType: "sap.m.CheckBox",
				success: function(aCheckBoxes) {
					Opa5.assert.equal(aCheckBoxes.length, 1);
					Opa5.assert.equal(aCheckBoxes[0].getSelected(), bChecked, "The CheckBox is " + (bChecked ? "on" : "off"));
				}
			});
		},
		iShouldSeeGroupSelectionWithEnabledShowFieldAsColumn: function(bEnabled) {
			return this.waitFor({
				controlType: "sap.m.CheckBox",
				success: function(aCheckBoxes) {
					Opa5.assert.equal(aCheckBoxes.length, 1);
					Opa5.assert.equal(aCheckBoxes[0].getEnabled(), bEnabled, "The CheckBox is " + (bEnabled ? "enabled" : "disabled"));
				}
			});
		},
		theComboBoxShouldHaveWarningMessage: function() {
			return this.waitFor({
				controlType: "sap.m.ComboBox",
				success: function(aComboBoxes) {
					var oComboBox = aComboBoxes[0];
					Opa5.assert.ok(oComboBox.getValueState() === coreLibrary.MessageType.Warning);
					Opa5.assert.ok(oComboBox.getValueStateText() === TestUtil.getTextFromResourceBundle("sap.ui.mdc", "PERSODIALOG_MSG_GROUPING_NOT_POSSIBLE_DESCRIPTION"));
				}
			});
		},
		theComboBoxShouldNotHaveWarningMessage: function() {
			return this.waitFor({
				controlType: "sap.m.ComboBox",
				success: function(aComboBoxes) {
					var oComboBox = aComboBoxes[0];
					Opa5.assert.ok(oComboBox.getValueState() === coreLibrary.MessageType.None);
					Opa5.assert.ok(oComboBox.getValueStateText() === "");
				}
			});
		},
		theComboBoxShouldHaveItemWithText: function(sValue, sItemText) {
			return this.waitFor({
				controlType: "sap.m.ComboBox",
				matchers: new sap.ui.test.matchers.PropertyStrictEquals({
					name: "value",
					value: sValue
				}),
				success: function(aComboBoxes) {
					Opa5.assert.equal(aComboBoxes.length, 1, "Combobox with selected value '" + sValue + "' found");
					Opa5.assert.ok(aComboBoxes[0].getItemByText(sItemText), "Item with text '" + sItemText + "' found");
				}
			});
		},
		iShouldSeeSortSelectionWithColumnName: function(sColumnName) {
			return this.waitFor({
				controlType: "sap.m.ComboBox",
				success: function(aComboBoxes) {
					var oComboBox = aComboBoxes[0];
					Opa5.assert.ok(oComboBox.getSelectedItem().getText() === sColumnName, "'" + sColumnName + "' is sorted");
				}
			});
		},
		iShouldSeeSortSelectionWithSortOrder: function(sSortOrder) {
			return this.waitFor({
				controlType: "sap.m.Select",
				success: function(aSelects) {
					var oSelect = aSelects[0];
					Opa5.assert.ok(oSelect.getSelectedItem().getText() === sSortOrder, sSortOrder + " is choosen");
				}
			});
		},
		iShouldSeeFilterSelectionWithColumnName: function(sColumnName) {
			return this.waitFor({
				controlType: "sap.m.ComboBox",
				success: function(aComboBoxes) {
					var oComboBox = aComboBoxes[0];
					Opa5.assert.ok(oComboBox.getSelectedItem().getText() === sColumnName, "Column '" + sColumnName + "' found");
				}
			});
		},
		iShouldSeeFilterSelectionWithOperation: function(sOperation) {
			return this.waitFor({
				controlType: "sap.m.Select",
				success: function(aSelects) {
					var oSelect = aSelects[0];
					Opa5.assert.ok(oSelect.getSelectedItem().getText() === sOperation, "Operation '" + sOperation + "' found");
				}
			});
		},
		iShouldSeeFilterSelectionWithValueDate: function(sDate) {
			var bFound = false;
			return this.waitFor({
				controlType: "sap.m.DatePicker",
				check: function(aDatePickers) {
					return aDatePickers.filter(function(oDatePicker) {
						sDate = DateFormat.getDateInstance().format(new Date(sDate));
						if (oDatePicker.getValue() === sDate) {
							bFound = true;
							return true;
						}
						return false;
					});
				},
				success: function() {
					Opa5.assert.ok(bFound);
				}
			});
		},
		iShouldSeeFilterSelectionWithValueInput: function(sText) {
			return this.waitFor({
				controlType: "sap.m.Input",
				success: function(aInputs) {
					var oInput = aInputs[0];
					Opa5.assert.ok(oInput.getValue() === sText);
				}
			});
		},
		theNumberOfFilterableColumnKeysShouldRemainStable: function() {
			var oTable = null;
			this.waitFor({
				controlType: "sap.ui.table.Table",
				success: function(aTables) {
					oTable = aTables[0];
				}
			});
			return this.waitFor({
				controlType: "sap.m.ComboBox",
				success: function(aComboBoxes) {
					var oComboBox = aComboBoxes[0];
					var oResult = oTable.getModel().getAnalyticalExtensions().findQueryResultByName("ProductCollection");
					var aFilterableColumns = oResult._oEntityType.getFilterablePropertyNames();
					Opa5.assert.ok(oComboBox.getKeys().length === aFilterableColumns.length);
				}
			});
		},
		theNumberOfSortableColumnKeysShouldRemainStable: function() {
			var oTable = null;
			this.waitFor({
				controlType: "sap.ui.table.Table",
				success: function(aTables) {
					oTable = aTables[0];
				}
			});
			return this.waitFor({
				controlType: "sap.m.ComboBox",
				success: function(aComboBoxes) {
					var oComboBox = aComboBoxes[0];
					var oResult = oTable.getModel().getAnalyticalExtensions().findQueryResultByName("ProductCollection");
					var aSortableColumns = oResult._oEntityType.getSortablePropertyNames();
					Opa5.assert.ok(oComboBox.getKeys().length - 1 === aSortableColumns.length); // (none) excluded
				}
			});
		},
		iShouldSeeRestoreButtonWhichIsEnabled: function(bEnabled) {
			return this.waitFor({
				searchOpenDialogs: true,
				visible: bEnabled,
				controlType: "sap.m.Button",
				success: function(aButtons) {
					var aRestoreButtons = aButtons.filter(function(oButton) {
						return oButton.getText() === TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.RESET");
					});
					Opa5.assert.equal(aRestoreButtons.length, 1);
					Opa5.assert.ok(aRestoreButtons[0].getEnabled() === bEnabled, "The 'Restore' is " + (bEnabled ? "enabled" : "disabled"));
				},
				errorMessage: "The 'Restore' is not " + (bEnabled ? "enabled" : "disabled")
			});
		},
		// iShouldSeeSelectedVariant: function(sVariantName) {
		// 	return this.waitFor({
		// 		controlType: "sap.ui.comp.smartvariants.SmartVariantManagement",
		// 		matchers: new sap.ui.test.matchers.PropertyStrictEquals({
		// 			name: "defaultVariantKey",
		// 			value: "*standard*"
		// 		}),
		// 		success: function(aSmartVariantManagements) {
		// 			Opa5.assert.equal(aSmartVariantManagements.length, 1, "SmartVariantManagement found");
		// 			var aVariantItem = aSmartVariantManagements[0].getVariantItems().filter(function(oVariantItem) {
		// 				return oVariantItem.getText() === sVariantName;
		// 			});
		// 			Opa5.assert.equal(aVariantItem.length, 1, "Variant '" + sVariantName + "' found");
		// 		},
		// 		errorMessage: "Could not find SmartVariantManagement"
		// 	});
		// },
		theTableHasFreezeColumn: function(sColumnName) {
			return this.waitFor({
				controlType: "sap.ui.table.Table",
				success: function(aTables) {
					Opa5.assert.equal(aTables.length, 1, "'sap.ui.table.Table' found");
					var aColumn = aTables[0].getColumns().filter(function(oColumn) {
						return oColumn.getLabel().getText() === sColumnName;
					});
					Opa5.assert.equal(aColumn.length, 1, "Column '" + sColumnName + "' found");
					Opa5.assert.equal(aColumn[0].getVisible(), true, "Column '" + sColumnName + "' is visible");
					var aVisibleColumns = aTables[0].getColumns().filter(function(oColumn) {
						return oColumn.getVisible() === true;
					});
					Opa5.assert.equal(aTables[0].getFixedColumnCount(), aVisibleColumns.indexOf(aColumn[0]) + 1, "Column '" + sColumnName + "' is fixed on position " + (aVisibleColumns.indexOf(aColumn[0]) + 1));
				}
			});
		},
		iShouldSeeColumnWithName: function(sColumnName) {
			return this.waitFor({
				controlType: "sap.m.Table",
				success: function(aTables) {
					var aColumn = aTables[0].getColumns().filter(function(oColumn) {
						return oColumn.getHeader().getText() === sColumnName;
					});
					Opa5.assert.equal(aColumn.length, 1, "Column '" + sColumnName + "' is visible");
				}
			});
		},
		theCellWithTextIsOfType: function(sText, sType) {
			return this.waitFor({
				controlType: sType,
				check: function(aControls) {
					return !!aControls.length;
				},
				matchers: new PropertyStrictEquals({
					name: "text",
					value: sText
				}),
				success: function(aControls) {
					Opa5.assert.equal(aControls.length, 1, "One control found");
				}
			});
		},
		iShouldSeeNavigationPopoverOpens: function() {
			return this.waitFor({
				controlType: "sap.m.Popover",
				check: function(aNavigationPopovers) {
					return aNavigationPopovers.length === 1;
				},
				success: function(aNavigationPopovers) {
					Opa5.assert.equal(aNavigationPopovers.length, 1, 'One NavigationPopover found');
				}
			});
		},
		iShouldSeeOnNavigationPopoverPersonalizationLinkText: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new sap.ui.test.matchers.PropertyStrictEquals({
					name: "text",
					value: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "info.POPOVER_DEFINE_LINKS")
				}),
				success: function(aButton) {
					Opa5.assert.equal(aButton.length, 1, "The 'More Links' button found");
				}
			});
		},
		iShouldNotSeeOnNavigationPopoverPersonalizationLinkText: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				check: function(aButtons) {
					return aButtons.filter(function(oButton) {
						return oButton.getText() === TestUtil.getTextFromResourceBundle("sap.ui.mdc", "info.POPOVER_DEFINE_LINKS");
					}).length === 0;
				},
				success: function(aButton) {
					Opa5.assert.equal(aButton.length, 0, "Button with text 'More Links' does not exist.");
				}
			});
		},
		iShouldSeeOrderedLinksOnNavigationContainer: function(aTexts) {
			var aVisibleAvailableActions;
			return this.waitFor({
				controlType: "sap.ui.mdc.link.Panel",
				check: function(aPanels) {
					Opa5.assert.equal(aPanels.length, 1, "One Panel found");
					var oPanel = aPanels[0];
					aVisibleAvailableActions = oPanel.getItems().filter(function(oAvailableAction) {
						return !!oAvailableAction.getVisible() && !!oAvailableAction.getHref();
					});
					Opa5.assert.equal(aVisibleAvailableActions.length, aTexts.length, "Amount of visible Links is as expected");
					return aVisibleAvailableActions.every(function(oAction, iIndex) {
						return oAction.getText() === aTexts[iIndex];
					});
				},
				error: function(oError) {
					var aVisibleAvailableActionTexts = [];
					aVisibleAvailableActionTexts = aVisibleAvailableActions.map(function(oVisibleAvailableAction) {
						return oVisibleAvailableAction.getText();
					});
					oError.errorMessage = "Links " + JSON.stringify(aTexts) + " not found on Panel " + JSON.stringify(aVisibleAvailableActionTexts) + " found instead.";
				}
			});
		},
		contactInformationExists: function() {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.ui.mdc.link.ContactDetails",
				success: function(aContactDetails) {
					Opa5.assert.equal(aContactDetails.length, 1, "1 ContactDetails found");
				}
			});
		},
		iShouldSeeStartRtaButton: function() {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new sap.ui.test.matchers.PropertyStrictEquals({
					name: "icon",
					value: "sap-icon://wrench"
				}),
				success: function(aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "One button found");
					Opa5.assert.equal(aButtons[0].getIcon(), "sap-icon://wrench", "The Start RTA button found");
				}
			});
		},
		iShouldSeeTheRtaToolbar: function() {
			return this.waitFor({
				controlType: "sap.m.HBox",
				matchers: function(oToolbar) {
					return oToolbar.$().hasClass("sapUiRtaToolbar");
				},
				success: function(oToolbar) {
					Opa5.assert.ok(oToolbar[0].getVisible(), "The Toolbar is shown.");
				},
				errorMessage: "Did not find the Toolbar"
			});
		},
		theRtaModeShouldBeClosed: function() {
			var aDomOverlay;
			return this.waitFor({
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					if (!frameJQuery) {
						return false;
					}
					var fnOverlay = frameJQuery.sap.getObject('sap.ui.dt.ElementOverlay');
					aDomOverlay = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnOverlay);
					return !aDomOverlay.length;
				},
				success: function() {
					Opa5.assert.ok(!aDomOverlay.length, "RTA mode is closed");
				},
				timeout: 5
			});
		},
		iShouldSeeTheRtaOverlayForTheViewId: function(sId) {
			var oApp;
			this.waitFor({
				id: sId,
				errorMessage: "The app is still busy..",
				success: function(oAppControl) {
					oApp = oAppControl;
				}
			});
			return this.waitFor({
				controlType: "sap.ui.dt.ElementOverlay",
				matchers: function(oOverlay) {
					return oOverlay.getElementInstance() === oApp;
				},
				success: function(oOverlay) {
					Opa5.assert.ok(oOverlay[0].getVisible(), "The Overlay is shown.");
				},
				errorMessage: "Did not find the Element Overlay for the App Control"
			});
		},
		theContextMenuOpens: function(sEntryText) {
			return this.waitFor({
				controlType: "sap.m.Popover",
				matchers: function(oPopover) {
					return oPopover.$().hasClass("sapUiDtContextMenu");
				},
				success: function(oPopover) {
					Opa5.assert.ok(oPopover[0].getVisible(), "The context menu is shown.");
				},
				errorMessage: "Did not find the Context Menu"
			});
		},
		theApplicationIsLoaded: function(sId) {
			var aDomApp;
			return this.waitFor({
				check: function() {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnApp = frameJQuery.sap.getObject('sap.m.App');
					aDomApp = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnApp);
					return !!aDomApp.length;
				},
				success: function() {
					Opa5.assert.equal(aDomApp.length, 1, "One app is loaded");
					Opa5.assert.equal(aDomApp[0].getId(), sId, "App '" + sId + "' is loaded");
				},
				timeout: 5
			});
		},
		theApplicationURLContains: function(sText) {
			return this.waitFor({
				check: function() {
					var sUrl = Opa5.getWindow().location.href;
					return sUrl.includes(sText);
				},
				success: function() {
					Opa5.assert.ok(true, "The URL of the Application is correct.");
				},
				timeout: 15
			});
		},
		theApplicationURLDoesNotContain: function(sText) {
			return this.waitFor({
				check: function() {
					var sUrl = Opa5.getWindow().location.href;
					return !sUrl.includes(sText);
				},
				success: function() {
					Opa5.assert.ok(true, "The URL of the Application is correct.");
				}
			});
		},
		iShouldSeeAConfirmationDialog: function() {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				matchers: new PropertyStrictEquals({
					name: "title",
					value: "Confirm"
				}),
				success: function() {
					Opa5.assert.ok(true, "The confirmation dialog is open.");
				}
			});
		}
	});
	return Assertion;
}, true);
