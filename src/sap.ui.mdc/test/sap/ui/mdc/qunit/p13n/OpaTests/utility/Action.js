/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/actions/EnterText",
	"test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/mdc/integration/testlibrary/p13n/Actions",
	"./actions/PressKey",
	"sap/m/MessageBox",
	"sap/ui/core/Core"
], function (Opa5, Press, Properties, Ancestor, Descendant, EnterText, TestUtil, PropertyStrictEquals, TestLibActions, PressKey, MessageBox, oCore) {
	"use strict";

	/**
	 * The Action can be used to...
	 *
	 * @class Action
	 * @extends sap.ui.test.Opa5
	 * @author SAP
	 * @private
	 * @alias sap.ui.mdc.qunit.p13n.test.Action
	 */
	var Action = Opa5.extend("sap.ui.mdc.qunit.p13n.test.Action", {

		iLookAtTheScreen: function () {
			return this;
		},

		iPressResetInDialog: function() {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Button",
				matchers: {
					properties: {
						text: oCore.getLibraryResourceBundle("sap.ui.mdc").getText("p13nDialog.RESET")
					},
					ancestor: {
						controlType: "sap.m.Dialog"
					}
				},
				success:function(aBtn) {
					Opa5.assert.equal(aBtn.length, 1, "Dialog with 'Reset' Button found");
				},
				actions: new Press()
			});
		},

		iConfirmResetWarning: function() {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Button",
				matchers: {
					properties: {
						text: oCore.getLibraryResourceBundle("sap.m").getText("MSGBOX_OK")
					},
					ancestor: {
						controlType: "sap.m.Dialog",
						properties: {
							icon: "sap-icon://alert"
						}
					}
				},
				success: function(aBtn) {
					Opa5.assert.equal(aBtn.length, 1, "Warning with one confirmation button found");
				},
				actions: new Press()
			});
		},

		iCancelResetWarning: function() {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Button",
				matchers: {
					properties: {
						text: oCore.getLibraryResourceBundle("sap.m").getText("MSGBOX_CANCEL")
					},
					ancestor: {
						controlType: "sap.m.Dialog",
						properties: {
							icon: "sap-icon://alert"
						}
					}
				},
				success: function(aBtn) {
					Opa5.assert.equal(aBtn.length, 1, "Warning with one cancel button found");
				},
				actions: new Press()
			});
		},

		iPressEscapeInDialog: function() {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Dialog",
				actions: new PressKey({
					keyCode: 27
				})
			});
		},

		iTogglePanelInDialog: function(sGroupName) {
			return TestLibActions.iToggleFilterPanel.call(this, sGroupName, true);
		},

		iSetP13nMode: function(sControl, aValue) {
			return this.waitFor({
				controlType: sControl,
				success: function(aControl) {
					aControl[0].setP13nMode(aValue);
				}
			});
		},


		iChangeTheModificationHandler: function(sControlId, sModificationHandler) {
			return this.waitFor({
				id: sControlId,
				success: function(oControl) {
					oControl.setModificationHandler(sModificationHandler);
				}
			});
		},

		iSwitchToP13nTab: function(sTab) {
			return this.waitFor({
				controlType: "sap.m.IconTabFilter",
				searchOpenDialogs: true,
				matchers: {
					ancestor: {
						controlType: "sap.m.p13n.Container"
					},
					properties: {
						text: sTab
					}
				},
				actions: new Press(),
				success: function(aTabs) {
					Opa5.assert.equal(aTabs.length, 1, "Found the correct tab " + sTab);
				},
				errorMessage: "Could not find tab" + sTab
			});
		},

		waitForP13nItem: function(oSettings){
			var bModal = oSettings.hasOwnProperty("modal") ? oSettings.modal : true;
			var sItemNameSpace = oSettings.itemNameSpace || "sap.m.ColumnListItem";
			var sPopoverTitle = oSettings.title;
			var sColumnName = oSettings.columnName;
			var fSuccess = oSettings.success;

			var aMatchers = [];

			if (sPopoverTitle){
				aMatchers.push(new PropertyStrictEquals({
					name: "title",
					value: sPopoverTitle
				}));
			}

			return this.waitFor({
				controlType: bModal ? "sap.m.Dialog" : "sap.m.ResponsivePopover",
				matchers: aMatchers,
				success: function () {
					this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Label",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: sColumnName
						}),
						success: function (aLabels) {
							this.waitFor({
								searchOpenDialogs: true,
								controlType: sItemNameSpace,
								matchers: new Descendant(aLabels[0], false),
								success: function (aColumnListItems) {
									fSuccess(aColumnListItems);
								}
							});
						}
					});
				}
			});
		},

		waitForP13nChartItemTemplateBox: function(oSettings){
			var bModal = oSettings.hasOwnProperty("modal") ? oSettings.modal : true;
			var sPopoverTitle = oSettings.title;
			var sKind = oSettings.kind;
			var fSuccess = oSettings.success;

			var MDCRb = oCore.getLibraryResourceBundle("sap.ui.mdc");
			var sPlaceholderName = MDCRb.getText('chart.PERSONALIZATION_DIALOG_TEMPLATE_PLACEHOLDER');
			var aMatchers = [];

			if (sPopoverTitle){
				aMatchers.push(new PropertyStrictEquals({
					name: "title",
					value: sPopoverTitle
				}));
			}

			return this.waitFor({
				controlType: bModal ? "sap.m.Dialog" : "sap.m.ResponsivePopover",
				matchers: aMatchers,
				success: function () {
					this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.ComboBox",
						matchers: new PropertyStrictEquals({
							name: "placeholder",
							value: sPlaceholderName
						}),
						success: function (aComboBox) {
							if (sKind === "Dimension" || sKind === "Groupable"){
								fSuccess(aComboBox[0]);
							} else {
								fSuccess(aComboBox[1]);
							}
						}
					});
				}
			});
		},

		iChangeComboBoxSelection : function(oComboBox, sNew, oSettings) {
			new Press().executeOn(oComboBox);
			this.waitFor({
				controlType: "sap.m.Popover",
				matchers: new Ancestor(oComboBox),
				success: function(aPopovers) {
					Opa5.assert.ok(aPopovers.length === 1, "ComboBox popover found");
					var oPopover = aPopovers[0];
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: [
							new Ancestor(oPopover, false),
							new PropertyStrictEquals({
								name: "title",
								value: sNew
							})
						],
						actions: new Press(),
						success: function(oSelect) {
							if (oSettings && typeof oSettings.success === "function") {
								oSettings.success.call(this, oSelect);
							}
						},
						errorMessage: "ComboBox StandardListItem with text '" + sNew + "' not found"
					});
				}
			});
		},

		iEnterTextInFilterDialog: function(sFilterName, sText, bLive) {
			return this.waitForP13nItem({
				itemNameSpace: "sap.m.ListItemBase",
				columnName: sFilterName,
				modal: typeof bLive == "boolean" ? !bLive : true,
				success: function(aItems) {
					var oFilterField = aItems.length > 1 ? aItems[1].getContent()[1].getItems()[0] : aItems[0].getCells()[1];
					Opa5.assert.ok(oFilterField,"FilterField found");
					setTimeout(function(){
						new EnterText({
							text: sText
						}).executeOn(oFilterField);
					});
				}
			});
		},

		iPressOnButtonWithIcon: function (sIcon) {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "icon",
					value: sIcon
				}),
				actions: new Press()
			});
		},

		iChangeAdaptFiltersView: function(sViewIcon) {
			return this.waitFor({
				controlType: "sap.m.Button",
				searchOpenDialogs: true,
				matchers: {
					ancestor: {
						controlType: "sap.ui.mdc.p13n.panels.AdaptFiltersPanel"
					},
					properties: {
						icon: sViewIcon
					}
				},
				success:function(aBtn) {
					Opa5.assert.equal(aBtn.length, 1, "Adapt Filters Panel toggle found");
				},
				actions: new Press()
			});
		},
		iClickOnP13nSelect: function (sName) {
			return this.waitFor({
				controlType: "sap.m.ComboBox",
				searchOpenDialogs: true,
				matchers: {
					properties: {
						selectedKey: sName
					}
				},
				success: function(aSelect) {
					Opa5.assert.equal(aSelect.length, 1, "Found one ComboBox control for key " + sName);
				},
				actions: new Press()
			});
		},
		iSelectP13nMenuItem: function (sName) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.StandardListItem",
				matchers: {
					properties: {
						title: sName
					}
				},
				actions: new Press()
			});
		},
		iRemoveSorting: function () {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Button",
				matchers: {
					properties: {
						icon: "sap-icon://decline"
					}
				},
				actions: new Press()
			});
		},
		iSelectColumn: function (sColumnName, sPopoverTitle, aP13nItems, bModal, bFilter) {
			return this.waitForP13nItem({
				columnName: sColumnName,
				title: sPopoverTitle,
				items: aP13nItems,
				modal: typeof bModal === "boolean" ? bModal : true,
				itemNameSpace: bFilter ? "sap.m.CustomListItem" : undefined,
				success: function(aColumnListItems) {
					var oColumnListItem = aColumnListItems[aColumnListItems.length - 1];
					var oCheckBox = oColumnListItem.getMultiSelectControl();
					new Press().executeOn(oCheckBox);
					//optional array update
					if (aP13nItems){
						var iIndex = oColumnListItem.getParent().getItems().indexOf(oColumnListItem);
						aP13nItems[iIndex].selected = oCheckBox.getSelected();
					}
				}
			});
		},
		iAddDimension : function(sColumnName, sPopoverTitle, aP13nItems, bModal){
			return this.waitForP13nChartItemTemplateBox({
				title: sPopoverTitle,
				items: aP13nItems,
				kind: "Dimension",
				modal: typeof bModal === "boolean" ? bModal : true,
				success: function(oComboBox) {
					this.iChangeComboBoxSelection(oComboBox, sColumnName);
				}.bind(this)
			});
		},
		iAddMeasure : function(sColumnName, sPopoverTitle, aP13nItems, bModal){
			return this.waitForP13nChartItemTemplateBox({
				title: sPopoverTitle,
				items: aP13nItems,
				kind: "Measure",
				modal: typeof bModal === "boolean" ? bModal : true,
				success: function(oComboBox) {
					this.iChangeComboBoxSelection(oComboBox, sColumnName);
				}.bind(this)
			});
		},
		iRemoveDimension : function(sColumnName){

			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.ComboBox",
				matchers: function(oComboBox){
					return oComboBox.getSelectedItem() ? oComboBox.getSelectedItem().getText() === sColumnName : false;
				},
				success: function(aComboBox){
					this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.ColumnListItem",
						matchers: new Descendant(aComboBox[0]),
						success: function(aListItem){
							this.waitFor({
								searchOpenDialogs: true,
								controlType: "sap.m.Button",
								matchers: [
									new PropertyStrictEquals({
										name: "icon",
										value: "sap-icon://decline"
									}),
									new Ancestor(aListItem[0])
								],
								actions: new Press()
							});
						}
					});
				}
			});
		},
		iClickOnListItem: function (sItemText) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.StandardListItem",
				matchers: new PropertyStrictEquals({
					name: "title",
					value: sItemText
				}),
				actions: new Press()
			});
		},
		iSimulateColumnResize: function (sName, sWidth) {
			return this.waitFor({
				controlType: "sap.ui.table.Table",
				success: function(aTable) {
					aTable[0].fireColumnResize({column:aTable[0].getColumns()[0],width: sWidth});
				}
			});
		},
		iClickOnColumn: function(sName, bResponsiveTable){
			var sColumnNameSpace = bResponsiveTable ? "sap.m.Column" : "sap.ui.table.Column";
			var sTableNameSpace = bResponsiveTable ? "sap.m.Table" : "sap.ui.table.Table";
			return this.waitFor({
				searchOpenDialogs: false,
				controlType: sTableNameSpace,
				success: function(aTables) {
					return this.waitFor({
						controlType: "sap.m.Label",
						matchers: [
							new PropertyStrictEquals({
							name: "text",
							value: sName
						}),
						new Ancestor(aTables[0])
					],
						success: function(aLabels){
							return this.waitFor({
								controlType: sColumnNameSpace,
								matchers: new Descendant(aLabels[0]),
								actions: new Press()
							});
						}
					});
				}
			});

		},
		iSortCurrentOpenColumnContextMenu: function() {
			return this.waitFor({
				controlType: "sap.m.Popover",
				success: function(aPopover) {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new Ancestor(aPopover[0]),
						actions: new Press()
					});
				}
			});
		},
		iClickOnTableItem: function (sItemText) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Label",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: sItemText
				}),
				success: function (aLabels) {
					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						matchers: new Descendant(aLabels[0]),
						actions: new Press()
					});
				}
			});
		},
		iClickOnTableItemWithComboBox: function (sItemName) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.ComboBox",
				matchers: function(oComboBox){
					return oComboBox.getSelectedItem() ? oComboBox.getSelectedItem().getText() === sItemName : false;
				},
				success: function (aLabels) {
					this.waitFor({
						controlType: "sap.m.ColumnListItem",
						matchers: new Descendant(aLabels[0]),
						actions: new Press()
					});
				}
			});
		},
		iClickOnOverlayForControl: function(sNameSpace) {
			return this.waitFor({
				controlType: "sap.ui.dt.ElementOverlay",
				success: function(aOverlays) {
					aOverlays.forEach(function(oOverlay){
						if (oOverlay.getElement().isA(sNameSpace)){
							new Press().executeOn(oOverlay);
						}
					});
				}
			});
		},
		iPressButtonWithText: function (sText) {
			return this.waitFor({
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: sText
				}),
				actions: new Press()
			});
		},
		iPressDialogOk: function() {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				success: function() {
					this.iPressButtonWithText(TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.OK"));
				}
			});
		},
		iPressDialogCancel: function(){
			return this.waitFor({
				controlType: "sap.m.Dialog",
				success: function() {
					this.iPressButtonWithText(TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.CANCEL"));
				}
			});
		},
		iSelectVariant: function (sVariantName) {
			return this.waitFor({
				controlType: "sap.ui.fl.variants.VariantManagement",
				matchers: {
					ancestor: {
						controlType: "sap.m.App"
					}
				},
				check: function (aVariantManagements) {
					return !!aVariantManagements.length;
				},
				actions: new Press(),
				success: function (aVariantManagements) {
					Opa5.assert.equal(aVariantManagements.length, 1, "VariantManagement found");
					// var aVariantItem = aSmartVariantManagements[0].getVariantItems().filter(function(oVariantItem) {
					// return oVariantItem.getText() === sVariantName;
					// });
					// Opa5.assert.equal(aVariantItem.length, 1, "Variant '" + sVariantName + "' found");
					this.waitFor({
						controlType: "sap.ui.core.Item",
						matchers: [
							new Ancestor(aVariantManagements[0]), new Properties({
								text: sVariantName
							})
						],
						actions: new Press(),
						errorMessage: "Cannot select '" + sVariantName + "' from VariantManagement"
					});
				},
				errorMessage: "Could not find VariantManagement"
			});
		},
		/*
		* This method will select a variant as default by passing the desired variant name
		*/
		iSelectDefaultVariant: function(sVariant){
			return this.waitFor({
				controlType: "sap.ui.fl.variants.VariantManagement",
				matchers: {
					ancestor: {
						controlType: "sap.m.App"
					}
				},
				actions: new Press(),
				success: function(aVM){
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: "Manage"
						}),
						actions: new Press(),
						success: function(){
							this.waitFor({
								controlType: "sap.m.Input",
								matchers: new PropertyStrictEquals({
									name: "value",
									value: sVariant
								}),
								success: function(aInput){
									this.waitFor({
										controlType: "sap.m.ColumnListItem",
										matchers: new Descendant(aInput[0]),
										success: function(aColumnListItem){
											this.waitFor({
												controlType: "sap.m.RadioButton",
												matchers: new Ancestor(aColumnListItem[0]),
												actions: new Press(),
												success: function(aBtn){
													this.waitFor({
														searchOpenDialogs: true,
														controlType: "sap.m.Button",
														matchers: new PropertyStrictEquals({
															name: "text",
															value: "Save",
															actions: new Press()
														}),
														actions: new Press()
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		},
		/**
		 * Used to test implicit p13n, should not be used in 'real' applications
		 */
		iDestroyTheVariantManagement: function() {
			return this.waitFor({
				controlType: "sap.ui.fl.variants.VariantManagement",
				matchers: {
					ancestor: {
						controlType: "sap.m.App"
					}
				},
				success: function(aVM) {
					aVM.forEach(function (oVM) {
						oVM.destroy();
					});
				}
			});
		},
		iSaveVariantAs: function (sVariantNameOld, sVariantNameNew) {
			return this.waitFor({
				controlType: "sap.ui.fl.variants.VariantManagement",
				matchers: {
					ancestor: {
						controlType: "sap.m.App"
					}
				},
				check: function (aVariantManagements) {
					return !!aVariantManagements.length;
				},
				// matchers: new PropertyStrictEquals({
				// 	name: "defaultVariantKey",
				// 	value: "*standard*"
				// }),
				actions: new Press(),
				success: function (aVariantManagements) {
					Opa5.assert.equal(aVariantManagements.length, 1, "VariantManagement found");
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: TestUtil.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_SAVEAS")
						}),
						actions: new Press(),
						success: function (aButtons) {
							Opa5.assert.equal(aButtons.length, 1, "'Save As' button found");
							this.waitFor({
								controlType: "sap.m.Input",
								matchers: new PropertyStrictEquals({
									name: "value",
									value: sVariantNameOld
								}),
								actions: new EnterText({
									text: sVariantNameNew
								}),
								success: function (aInputs) {
									Opa5.assert.ok(aInputs[0].getValue() === sVariantNameNew, "Input value is set to '" + sVariantNameNew + "'");
									this.waitFor({
										controlType: "sap.m.Button",
										matchers: new PropertyStrictEquals({
											name: "text",
											value: TestUtil.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_SAVE")
										}),
										actions: new Press(),
										success: function (aButtons) {
											Opa5.assert.equal(aButtons.length, 1, "'OK' button found");
										}
									});
								}
							});
						},
						errorMessage: "Cannot find 'Save As' button on VariantManagement"
					});
				},
				errorMessage: "Could not find VariantManagement"
			});
		},
		iEnterValueInP13nSearchField: function(sValue) {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				success: function(aDialogs) {
					return this.waitFor({
						controlType: "sap.m.SearchField",
						matchers: new Ancestor(aDialogs[0], false),
						actions: new EnterText({
							text: sValue
						})
					});
				}
			});
		},
		iCloseTheColumnMenu: function() {
			return TestUtil.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					oColumnMenu.close();
				}
			});
		},
		iUseColumnMenuQuickSort: function(mConfig) {
			return TestUtil.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.table.columnmenu.QuickSortItem",
						visible: false,
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								key: mConfig.key
							}
						}],
						success: function(aQuickSortItems) {
							this.waitFor({
								controlType: "sap.m.ToggleButton",
								matchers: [{
									ancestor: aQuickSortItems[0]
								}],
								success: function(aToggleButtons) {
									function pressButton(oButton, bShouldBePressed) {
										if (mConfig.sortOrder === "None" && oButton.getPressed() || bShouldBePressed && !oButton.getPressed()) {
											new Press().executeOn(oButton);
										}
									}

									pressButton(aToggleButtons[0], mConfig.sortOrder === "Ascending");
									pressButton(aToggleButtons[1], mConfig.sortOrder === "Descending");
								},
								errorMessage: "QuickSortItem content is not visible"
							});
						},
						errorMessage: "Column menu QuickSortItem not found"
					});
				}
			});
		},
		iUseColumnMenuQuickGroup: function(mConfig) {
			return TestUtil.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.table.columnmenu.QuickGroupItem",
						visible: false,
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								key: mConfig.key
							}
						}],
						success: function(aQuickGroupItems) {
							this.waitFor({
								controlType: "sap.m.ToggleButton",
								matchers: [{
									ancestor: aQuickGroupItems[0].getParent(),
									properties: {
										text: aQuickGroupItems[0].getLabel()
									}
								}],
								success: function(aToggleButtons) {
									if (mConfig.grouped && !aToggleButtons[0].getPressed() || !mConfig.grouped && aToggleButtons[0].getPressed()) {
										new Press().executeOn(aToggleButtons[0]);
									}
								},
								errorMessage: "QuickSortItem content is not visible"
							});
						},
						errorMessage: "Column menu QuickSortItem not found"
					});
				}
			});
		},
		iUseColumnMenuQuickTotal: function(mConfig) {
			return TestUtil.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.table.columnmenu.QuickTotalItem",
						visible: false,
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								key: mConfig.key
							}
						}],
						success: function(aQuickTotalItems) {
							this.waitFor({
								controlType: "sap.m.ToggleButton",
								matchers: [{
									ancestor: aQuickTotalItems[0].getParent(),
									properties: {
										text: aQuickTotalItems[0].getLabel()
									}
								}],
								success: function(aToggleButtons) {
									if (mConfig.totaled && !aToggleButtons[0].getPressed() || !mConfig.totaled && aToggleButtons[0].getPressed()) {
										new Press().executeOn(aToggleButtons[0]);
									}
								},
								errorMessage: "QuickTotalItem content is not visible"
							});
						},
						errorMessage: "Column menu QuickTotalItem not found"
					});
				}
			});
		},
		iPressOnColumnMenuItem: function(sLabel) {
			return TestUtil.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.StandardListItem",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								title: sLabel
							}
						}],
						actions: new Press(),
						errorMessage: "Column menu item '" + sLabel + "' not found"
					});
				}
			});
		},
		iNavigateBackFromColumnMenuItemContent: function() {
			return TestUtil.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								type: "Back"
							}
						}],
						actions: new Press(),
						errorMessage: "Could not navigate back from column menu item content"
					});
				}
			});
		},
		iResetColumnMenuItemContent: function() {
			return TestUtil.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								text: TestUtil.getTextFromResourceBundle("sap.m", "table.COLUMNMENU_RESET")
							}
						}],
						actions: new Press(),
						errorMessage: "Colum menu item content could not be reset"
					});
				}
			});
		},
		iConfirmColumnMenuItemContent: function() {
			return TestUtil.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								text: TestUtil.getTextFromResourceBundle("sap.m", "table.COLUMNMENU_CONFIRM")
							}
						}],
						actions: new Press(),
						errorMessage: "Colum menu item content could not be confirmed"
					});
				}
			});
		},
		iCancelColumnMenuItemContent: function() {
			return TestUtil.waitForColumnMenu.call(this, {
				success: function(oColumnMenu) {
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [{
							ancestor: oColumnMenu,
							properties: {
								text: TestUtil.getTextFromResourceBundle("sap.m", "table.COLUMNMENU_CANCEL")
							}
						}],
						actions: new Press(),
						errorMessage: "Colum menu item content could not be canceled"
					});
				}
			});
		}
	});

	return Action;
});
