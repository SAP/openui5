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
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, Press, Properties, Ancestor, Descendant, EnterText, TestUtil, PropertyStrictEquals) {
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

		waitForP13nItem: function(oSettings){
			var bModal = oSettings.modal;
			var sPopoverTitle = oSettings.title;
			var sColumnName = oSettings.columnName;
			var fSuccess = oSettings.success;
			return this.waitFor({
				controlType: bModal ? "sap.m.ResponsivePopover" : "sap.m.Dialog" ,
				matchers: new PropertyStrictEquals({
					name: "title",
					value: sPopoverTitle
				}),
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
								controlType: "sap.m.ColumnListItem",
								matchers: new Descendant(aLabels[0]),
								success: function (aColumnListItems) {
									fSuccess(aColumnListItems);
								}
							});
						}
					});
				}
			});
		},

		iEnterTextInFilterDialog: function(sFilterName, sText) {
			return this.waitForP13nItem({
				columnName: sFilterName,
				title:  TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filter.PERSONALIZATION_DIALOG_TITLE"),
				modal: false,
				success: function(aColumnListItems) {
					var oFilterField = aColumnListItems[0].getCells()[1];
					Opa5.assert.ok(oFilterField,"FilterField found");
					new EnterText({
						text: sText
					}).executeOn(oFilterField);
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

		iSelectColumn: function (sColumnName, sPopoverTitle, aP13nItems, bModal) {
			return this.waitForP13nItem({
				columnName: sColumnName,
				title: sPopoverTitle,
				items: aP13nItems,
				modal: bModal,
				success: function(aColumnListItems) {
					var oCheckBox = aColumnListItems[0].getMultiSelectControl();
					oCheckBox.$().trigger("tap");

					//optional array update
					if (aP13nItems){
						var iIndex = aColumnListItems[0].getParent().getItems().indexOf(aColumnListItems[0]);
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
						success: function (aColumnListItems) {
							aColumnListItems[0].$().trigger("tap");
						}
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
															value: "OK",
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
