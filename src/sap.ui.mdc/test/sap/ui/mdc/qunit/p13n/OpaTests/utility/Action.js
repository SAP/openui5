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
	"sap/m/MessageBox"
], function (Opa5, Press, Properties, Ancestor, Descendant, EnterText, TestUtil, PropertyStrictEquals, TestLibActions, PressKey, MessageBox) {
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
						text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("p13nDialog.RESET")
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
						text: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("MSGBOX_OK")
					},
					ancestor: {
						controlType: "sap.m.Dialog",
						properties: {
							icon: "sap-icon://message-warning"
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
						text: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("MSGBOX_CANCEL")
					},
					ancestor: {
						controlType: "sap.m.Dialog",
						properties: {
							icon: "sap-icon://message-warning"
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
		iClickOnColumn: function(sName, bGridTable){
			var sColumnNameSpace = bGridTable ? "sap.ui.table.Column" : "sap.m.Column";
			var sTableNameSpace = bGridTable ? "sap.ui.table.Table" : "sap.m.Table";
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
		iClickOnRtaSetting: function(sIcon) {
			return this.waitFor({
				controlType: "sap.m.Popover",
				success: function(aPopovers) {
					var oPopover = aPopovers[0];
					this.waitFor({
						controlType: "sap.m.Button",
						matchers: [
							new Ancestor(oPopover),
							new PropertyStrictEquals({
								name: "icon",
								value: sIcon
							})
						],
						actions: new Press()
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
		}
	});

	return Action;
}, true);
