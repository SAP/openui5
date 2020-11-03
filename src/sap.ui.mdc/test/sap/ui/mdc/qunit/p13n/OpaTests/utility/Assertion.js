/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/mdc/integration/testlibrary/p13n/waitForPanelInP13n"
], function (Opa5, PropertyStrictEquals, Properties, Ancestor, Descendant, waitForPanelInP13n) {
	"use strict";

	/**
	 * The Assertion can be used to...
	 *
	 * @class Assertion
	 * @extends sap.ui.test.Opa5
	 * @author SAP
	 * @private
	 * @alias sap.ui.mdc.qunit.p13n.test.Assertion
	 */
	var Assertion = Opa5.extend("sap.ui.mdc.qunit.p13n.test.Assertion", {
		iShouldSeeButtonWithIcon: function (sIcon) {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new sap.ui.test.matchers.PropertyStrictEquals({
					name: "icon",
					value: sIcon
				}),
				success: function (aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "One button found");
					Opa5.assert.equal(aButtons[0].getIcon(), sIcon, "The button " + sIcon + " found.");
				}
			});
		},
		iShouldSeeRTABar: function() {
			return this.waitFor({
				controlType: "sap.ui.rta.toolbar.Standalone",
				success: function(aRTAToolBar) {
					Opa5.assert.equal(aRTAToolBar.length, 1, "RTA has been started");
				}
			});
		},
		iShouldSeeRTAPopoverWithActions: function(iButtons) {
			return this.waitFor({
				controlType: "sap.m.Popover",
				success: function(aPopover) {
					Opa5.assert.equal(aPopover.length, 1, "RTA has been started");
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new Ancestor(aPopover[0]),
						success: function(aButtons){
							Opa5.assert.equal(aButtons.length, iButtons, "Correct amount of actions");
						}
					});
				}
			});
		},
		iShouldSeeButtonWithText: function (sText) {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new sap.ui.test.matchers.PropertyStrictEquals({
					name: "text",
					value: sText
				}),
				success: function (aButtons) {
					Opa5.assert.equal(aButtons.length, 1, "One button found");
					Opa5.assert.equal(aButtons[0].getText(), sText, "The button " + sText + " found.");
				}
			});
		},
		iShouldSeeVisibleDimensionsInOrder: function (aOrderedDimensionNames) {
			var aDomElements;
			return this.waitFor({
				controlType: "sap.chart.Chart",
				check: function () {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnControl = frameJQuery.sap.getObject("sap.chart.Chart");
					aDomElements = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnControl);
					return aDomElements[0].getVisibleDimensions().length === aOrderedDimensionNames.length;
				},
				success: function () {
					Opa5.assert.equal(aDomElements.length, 1, "One sap.chart.Chart control found");
					Opa5.assert.equal(aDomElements[0].getVisibleDimensions().length, aOrderedDimensionNames.length, "Chart contains " + aOrderedDimensionNames.length + " visible dimensions");
					aDomElements[0].getVisibleDimensions().forEach(function (sDimension, iIndex) {
						var oDimension = aDomElements[0].getDimensionByName(sDimension);
						var sDimensionName = oDimension.getLabel() || oDimension.getName();
						Opa5.assert.equal(sDimensionName, aOrderedDimensionNames[iIndex], "Dimension '" + sDimensionName + "' is visible on position " + (iIndex + 1));
					});
				}
			});
		},
		iShouldSeeVisibleMeasuresInOrder: function (aOrderedMeasureNames) {
			var aDomElements;
			return this.waitFor({
				controlType: "sap.chart.Chart",
				check: function () {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnControl = frameJQuery.sap.getObject("sap.chart.Chart");
					aDomElements = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnControl);
					return aDomElements[0].getVisibleMeasures().length === aOrderedMeasureNames.length;
				},
				success: function () {
					Opa5.assert.equal(aDomElements.length, 1, "One sap.chart.Chart control found");
					Opa5.assert.equal(aDomElements[0].getVisibleMeasures().length, aOrderedMeasureNames.length, "Chart contains " + aOrderedMeasureNames.length + " visible measures");
					aDomElements[0].getVisibleMeasures().forEach(function (sMeasure, iIndex) {
						var oMeasure = aDomElements[0].getMeasureByName(sMeasure);
						var sMeasureName = oMeasure.getLabel() || oMeasure.getName();
						Opa5.assert.equal(sMeasureName, aOrderedMeasureNames[iIndex], "Measure '" + sMeasureName + "' is visible on position " + (iIndex + 1));
					});
				}
			});
		},
		iShouldSeeChartOfType: function (sChartTypeKey) {
			var aDomElements;
			return this.waitFor({
				controlType: "sap.chart.Chart",
				check: function () {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnControl = frameJQuery.sap.getObject("sap.chart.Chart");
					aDomElements = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnControl);
					return aDomElements[0].getChartType() === sChartTypeKey;
				},
				success: function () {
					Opa5.assert.equal(aDomElements.length, 1, "One sap.chart.Chart control found");
					Opa5.assert.equal(aDomElements[0].getChartType(), sChartTypeKey, "The chart type of the Chart is '" + sChartTypeKey + "'");
				}
			});
		},
		thePersonalizationDialogOpens: function (bLiveMode) {
			return this.waitFor({
				controlType: bLiveMode ? "sap.m.Popover" : "sap.m.Dialog",
				check: function (aDialogs) {
					return aDialogs.length > 0;
				},
				success: function (aDialogs) {
					//TODO: remove the line below once there is apossibility to set the tolerance on the
					//popover and handle this issue via the personalization logic itself
					aDialogs[0]._followOfTolerance = 96;
					Opa5.assert.equal(aDialogs.length, 1, 'Personalization Dialog should be open');
				}
			});
		},
		iShouldSeeDialogTitle: function (sText) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Title",
				matchers: [
					new sap.ui.test.matchers.PropertyStrictEquals({
						name: "text",
						value: sText
					}), new sap.ui.test.matchers.PropertyStrictEquals({
						name: "level",
						value: "H2"
					})
				],
				success: function (aTitle) {
					Opa5.assert.equal(aTitle.length, 1, "Title found");
				},
				errorMessage: "sap.m.Title not found"
			});
		},

		iShouldSeeAdaptFiltersTitle: function (sTitle) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Title",
				matchers: {
					ancestor: {
						controlType: "sap.m.Dialog"
					},
					properties: {
						text: sTitle
					}
				},
				success: function(aMenuBtn) {
					Opa5.assert.equal(aMenuBtn[0].getText(), sTitle, "Correct title provided");
				}
			});
		},

		/**
		 * This method will check the text, selected status and index of a given array in a p13n dialog, which contains p13n items in a defined structure.
		 * Note: the index of the p13n item in the array will also be checked, according to the index of the item in the dialog.
		 *
		 * @param {object} aItems - the array which is containing the items to be checked in the dialog as following: [{p13nItem: 'Country', selected: true}]
		 * @private
		 */
		iShouldSeeP13nItems: function (vItems) {
			vItems.forEach(function (oItem, iIndex) {
				this.waitFor({
					searchOpenDialogs: true,
					controlType: "sap.m.Label",
					matchers: new PropertyStrictEquals({
						name: "text",
						value: oItem.p13nItem
					}),
					success: function (aLabels) {
						this.waitFor({
							controlType: "sap.m.ColumnListItem",
							matchers: new Descendant(aLabels[0]),
							success: function (aColumnListItems) {
								Opa5.assert.equal(aColumnListItems[0].getParent().getItems().indexOf(aColumnListItems[0]), iIndex, "Table item is on the correct index");
								Opa5.assert.equal(aColumnListItems[0].getSelected(), oItem.selected, "The item is selected: " + oItem.selected);
								Opa5.assert.equal(aLabels[0].getText(), oItem.p13nItem, "Item does contain the correct text " + oItem.p13nItem + " for the Label");
							}
						});
					}
				});
			}.bind(this));
		},

		/**
		 * This method will check the text, selected status and index of a given array in a p13n dialog, which contains p13n items in a defined structure.
		 * Note: the index of the p13n item in the array will also be checked, according to the index of the item in the dialog.
		 *
		 * @param {object} sItemText - a string representing an item within a mdc BasePanel derived panel
		 * @param {object} iIndex - the position of the item in the inner table of the panel
		 * @param {object} bSelected - flag to compare the selection with the expected and actual state
		 * @private
		 */
		iShouldSeeP13nItem: function(sItemText, iIndex, bSelected) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Label",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: sItemText
				}),
				success: function(aLabels) {
					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						matchers: new Descendant(aLabels[0]),
						success: function(aColumnListItems) {
							Opa5.assert.equal(aColumnListItems.length, 1);
							Opa5.assert.ok(aColumnListItems[0]);
							Opa5.assert.equal(aColumnListItems[0].getParent().getItems().indexOf(aColumnListItems[0]), iIndex, "Table item is on the correct index");
							Opa5.assert.equal(aLabels[0].getText(), sItemText, "Item does contain the correct text " + sItemText + " for the Label");
							if (bSelected !== undefined) {
								Opa5.assert.equal(aColumnListItems[0].getSelected(), bSelected, "The item is selected: " + bSelected);
							}
						}
					});
				}
			});
		},

		/**
		 * This method will check for existing FilterFields with label + index
		 *
		 * @param {object} mSettings - a map containing the settings to check for
		 * @param {string} mSettings.itemText - a string representing an item within a mdc BasePanel derived panel
		 * @param {int} mSettings.index - the position of the item in the inner table of the panel
		 * @param {array} mSettings.values - the optional FilterField condition values for the provided item
		 * @param {sap.ui.core.Control} mSettings.panel - to identify the group of the affected item
		 * @param {boolean} mSettings.selected - check if the item is selected
		 * @param {boolean} mSettings.hidden - the filter field should not be visible
		 *
		 * @private
		 */
		iShouldSeeP13nFilterItem: function(mSettings) {

			var sItemText = mSettings.itemText;
			var iIndex = mSettings.index;
			var aValues = mSettings.values;
			var oPanel = mSettings.panel;
			var bSelected = mSettings.selected;
			var bFilterFieldHidden = !!mSettings.hidden;

			var aMatchers = [
				new Properties({
					text: sItemText
				})
			];

			if (oPanel) {
				aMatchers.push(oPanel);
			}

			aValues = aValues ? aValues : [];

			return this.waitFor({
				controlType: "sap.m.Label",
				searchOpenDialogs: true,
				matchers: aMatchers,
				success: function(aLabels) {
					//TODO: simplify and rework this method once the Table inbuilt filtering uses the same layout as the FilterBar for adaptation
					var oListItem = aLabels[0].getParent().isA("sap.m.ListItemBase") ? aLabels[0].getParent() : aLabels[0].getParent().getParent();
					if (bFilterFieldHidden) {
						Opa5.assert.equal(oListItem.getContent().length, 1, "No FilterField available");
					} else {
						var oFilterField = oListItem.getContent ? oListItem.getContent()[1].getItems()[0] : oListItem.getCells()[1];
						if (aValues.length > 0){
							aValues.forEach(function(sValue, iIndex){
								var oValue = oFilterField.getConditions()[iIndex];
								Opa5.assert.deepEqual(oValue ? oValue.values[0] : undefined, sValue, "Correct conditions in FF");
							});
						}
						if (bSelected === false || bSelected === true){
							Opa5.assert.equal(oListItem.getSelected(), bSelected, "Selection state correct");
						}
						Opa5.assert.equal(oFilterField.getLabel(), sItemText, "Item with label:' " + sItemText + "' has been found." );
						var iFieldIndex = oListItem.getParent().indexOfItem(oListItem);
						Opa5.assert.equal(iFieldIndex, iIndex, "Item is on correct index");
					}
				}
			});
		},

		iShouldSeeVisibleItemsInTable: function(iItems){
			return this.waitFor({
				controlType: "sap.m.Table",
				matchers: {
					ancestor: {
						controlType: "sap.ui.mdc.Table"
					}
				},
				success: function(aTable) {
					var oTable = aTable[0];

					Opa5.assert.equal(oTable.getItems().length, iItems, "The Table holds the correct amount of items:" + iItems + " items found");

				}
			});
		},

		iShouldSeeP13nFilterItems: function(aP13nFilterItems){
			aP13nFilterItems.forEach(function(oP13nFilterItem, iIndex){
				return this.iShouldSeeP13nFilterItem({
					itemText: oP13nFilterItem.p13nItem,
					index: iIndex,
					values: oP13nFilterItem.value
				});
			}.bind(this));
		},

		iShouldSeeP13nFilterItemsInPanel: function(aP13nFilterItems, sGroupName, bNoFilterField){
			return waitForPanelInP13n.call(this, {
				groupName: sGroupName,
				modal: true,
				success: function(oPanel){
					aP13nFilterItems.forEach(function(oP13nFilterItem, iIndex){
						return this.iShouldSeeP13nFilterItem({
							itemText: oP13nFilterItem.p13nItem,
							index: iIndex,
							values: oP13nFilterItem.value,
							panel: oPanel,
							selected: oP13nFilterItem.selected,
							hidden: bNoFilterField
						});
					}.bind(this));
				}
			});
		},

		iShouldSeeItemOnPosition: function (sItemText, iIndex) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function (aTables) {
					var aItems = aTables[0].getItems().filter(function (oItem) {
						return oItem.getCells()[0].getText() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0]);
					Opa5.assert.equal(aItems[0].getVisible(), true);
					Opa5.assert.equal(aTables[0].getItems().indexOf(aItems[0]), iIndex, sItemText + " is on position " + iIndex);
				}
			});
		},

		/*
		* checks if a select control is enabled for the given corresponding label
		*/
		iShouldSeeEnabledSelectControl: function (sText, bEnabled) {
			this.waitFor({
				controlType: "sap.m.Label",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: sText
				}),
				success: function(aLabels) {
					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						matchers: new Descendant(aLabels[0]),
						success:function(aColumnListItem){
							this.waitFor({
								controlType:"sap.m.Select",
								matchers: new Ancestor(aColumnListItem[0]),
								success: function(aSelect){
									Opa5.assert.equal(aSelect[0].getEnabled(),bEnabled,"The select control with the corresponding label " + sText + " is " + bEnabled);
								}
							});
						}
					});
				}
			});
		},
		iShouldSeeListItemOnPosition: function (sItemText, iIndex) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.List",
				success: function (aLists) {
					var aItems = aLists[0].getItems().filter(function (oItem) {
						return oItem.getTitle() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0]);
					Opa5.assert.equal(aItems[0].getVisible(), true);
					Opa5.assert.equal(aLists[0].getItems().indexOf(aItems[0]), iIndex, sItemText + " is on position " + iIndex);
				}
			});
		},
		iShouldSeeItemWithSelection: function (sItemText, bSelected) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Table",
				success: function (aTables) {
					var aItems = aTables[0].getItems().filter(function (oItem) {
						return oItem.getCells()[0].getText() === sItemText;
					});
					Opa5.assert.equal(aItems.length, 1);
					Opa5.assert.ok(aItems[0]);
					Opa5.assert.equal(aItems[0].getVisible(), true);
					Opa5.assert.equal(aItems[0].getSelected(), bSelected, sItemText + " is " + (bSelected ? "selected" : "unselected"));
				}
			});
		},
		thePersonalizationDialogShouldBeClosed: function () {
			var aDomDialogs;
			return this.waitFor({
				check: function () {
					var frameJQuery = Opa5.getWindow().jQuery;
					var fnDialog = frameJQuery.sap.getObject('sap.m.ResponsivePopover');
					aDomDialogs = Opa5.getPlugin().getAllControlsInContainer(frameJQuery('body'), fnDialog);
					return !aDomDialogs.length;
				},
				success: function () {
					Opa5.assert.ok(!aDomDialogs.length, "The p13n dialog is closed");
				}
			});
		},
		theVariantManagementIsDirty: function (bIsDirty) {
			return this.waitFor({
				controlType: "sap.ui.fl.variants.VariantManagement",
				matchers: new PropertyStrictEquals({
					name: "modified",
					value: bIsDirty
				}),
				success: function (aVariantManagements) {
					Opa5.assert.equal(aVariantManagements.length, 1, "Dirty VariantManagement found");
				},
				errorMessage: "Could not find dirty VariantManagement"
			});
		},
		iShouldSeeSelectedVariant: function (sVariantName) {
			return this.waitFor({
				controlType: "sap.ui.fl.variants.VariantManagement",
				check: function (aVariantManagements) {
					return !!aVariantManagements.length;
				},
				success: function (aVariantManagements) {
					Opa5.assert.equal(aVariantManagements.length, 1, "VariantManagement found");
					this.waitFor({
						controlType: "sap.m.Title",
						matchers: [
							new Ancestor(aVariantManagements[0]), new Properties({
								text: sVariantName
							})
						],
						success: function (aItems) {
							Opa5.assert.equal(aItems.length, 1, "Variant '" + sVariantName + "' found");
						},
						errorMessage: "Could not find core item with text " + sVariantName
					});
				},
				errorMessage: "Could not find VariantManagement"
			});
		},
		iShouldSeeVisibleColumnsInOrder: function (sColumnType, aOrderedColumnNames) {
			return this.waitFor({
				visible: false,
				controlType: sColumnType,
				check: function (aExistingColumns) {
					return aExistingColumns.length === aOrderedColumnNames.length;
				},
				success: function (aExistingColumns) {
					Opa5.assert.equal(aOrderedColumnNames.length, aExistingColumns.length);
					aExistingColumns.forEach(function (oColumn, iIndex) {
						var sName = oColumn.getDataProperty();
						Opa5.assert.equal(sName, aOrderedColumnNames[iIndex], "Column '" + aOrderedColumnNames[iIndex] + "' is visible on position " + (iIndex + 1));
					});
				}
			});
		},

		iShouldSeeTableConditions: function(oFilterConditions) {
			return this.waitFor({
				controlType: "sap.ui.mdc.Table",
				success: function(aTables) {
					Opa5.assert.ok(aTables.length == 1);
					var oTable = aTables[0];
					oTable.initialized().then(function(oTable){
						Opa5.assert.deepEqual(oTable.getFilterConditions(), sap.base.util.merge(oFilterConditions), "Table holds correct filterConditions");
					});
				}
			});
		},

		iShouldSeeVisibleColumnsInOrderInTable: function (sTableType, sColumnType, aOrderedColumnNames) {
			return this.waitFor({
				controlType: sTableType,
				success: function (aTables) {
					Opa5.getContext().control = aTables[0];
					var aExistingColumns = aTables[0].getColumns();
					Opa5.assert.equal(aOrderedColumnNames.length, aExistingColumns.length);
					aExistingColumns.forEach(function (oColumn, iIndex) {
						var sName = oColumn.getDataProperty();
						Opa5.assert.equal(sName, aOrderedColumnNames[iIndex], "Column '" + aOrderedColumnNames[iIndex] + "' is visible on position " + (iIndex + 1));
					});
				}
			});
		},
		iShouldSeeVisibleFiltersInOrderInFilterBar: function (aFilterFieldLabels) {
			return this.waitFor({
				controlType: "sap.ui.mdc.FilterBar",
				success: function (aFilterBar) {
					var aFilterFields = aFilterBar[0].getFilterItems();
					aFilterFields.forEach(function (oFilterField, iIndex) {
						Opa5.assert.equal(oFilterField.getLabel(), aFilterFieldLabels[iIndex], "correct FilterField found in view");
					});
				}
			});
		},
		iShouldSeeConditionValuesInFilterBar: function (aValues, sFilterKey) {
			return this.waitFor({
				controlType: "sap.ui.mdc.FilterBar",
				success: function (aFilterBar) {
					var aConditions = aFilterBar[0].getConditions();
					var oFilterConfig = aConditions[sFilterKey] && aConditions[sFilterKey][0];
					Opa5.assert.deepEqual(oFilterConfig && oFilterConfig.values, aValues, "correct filter configuration found in view");
				}
			});
		}
	});
	return Assertion;
}, true);
