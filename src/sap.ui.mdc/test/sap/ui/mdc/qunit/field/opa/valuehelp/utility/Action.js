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
	"sap/ui/test/matchers/PropertyStrictEquals",
	"./actions/PressKey",
	"sap/m/MessageBox",
	"sap/ui/events/KeyCodes"

], function (Opa5, Press, Properties, Ancestor, Descendant, EnterText, PropertyStrictEquals, PressKey, MessageBox, KeyCodes) {
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

		iSelectUITableItems: function (aTexts) {
			aTexts.forEach(function (sText, iIndex) {
				this.waitFor({
					searchOpenDialogs: true,
					controlType: "sap.m.Text",
					matchers: {
						properties: {
							text: sText
						}
					},
					success: function (aResults) {
						Opa5.assert.ok("The item is selected. ");
					},
					actions: new Press()
				});
			}.bind(this));
		},

		iPressOnSearchIcon: function() {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.SearchField",
				success: function(aControls) {
					aControls[0].$().find(".sapMSFS").trigger("tap");
					Opa5.assert.ok(aControls.length, 1, "Clicked icon on Searchfield.");
				}
			});
		},
		iEnterTextOnDialogSearchField: function(sValue) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.SearchField",
				success: function(aControls) {
					aControls[0].focus();
					new EnterText({
						text: sValue
					}).executeOn(aControls[0]);
					Opa5.assert.ok(aControls.length, 1, "'" + sValue + "' entered on Searchfield.");
				}
			});
		},

		iPressValueHelpIconOnFilterFieldWithLabel: function(sText, sValue) {
			return this.waitFor({
				controlType: "sap.ui.mdc.FilterField",
				matchers: {
					properties: {
						label: sText
					}
				},
				success: function(aResult) {
					this.waitFor({
						controlType: "sap.ui.core.Icon",
						matchers: new Ancestor(aResult[0]),
						actions: new Press(),
						success: function() {
							Opa5.assert.equal(aResult.length, 1, "Icon pressed on FilterField with label '" + sText + "'.");
						}
					});
				}
			});
		},

		iEnterTextOnFilterFieldWithLabel: function(sText, sValue, bKeepFocus) {
			return this.waitFor({
				controlType: "sap.ui.mdc.FilterField",
				matchers: {
					properties: {
						label: sText
					}
				},
				success: function(aBtn) {
					aBtn[0].focus();
					new EnterText({
						text: sValue,
						keepFocus: typeof bKeepFocus !== "undefined" ? bKeepFocus : true
					}).executeOn(aBtn[0].getAggregation("_content")[0]);
					Opa5.assert.equal(aBtn.length, 1, "Text '" + sValue + "' entered on FilterField with label '" + sText + "'.");
				}
			});
		},

		iPressKeyOnFilterFieldWithLabel: function(sText, keyCode) {
			return this.waitFor({
				controlType: "sap.ui.mdc.FilterField",
				matchers: {
					properties: {
						label: sText
					}
				},
				success:function(aBtn) {
					aBtn[0].focus();
					new PressKey({
						keyCode: keyCode
					}).executeOn(aBtn[0].getAggregation("_content")[0]);
					Opa5.assert.equal(aBtn.length, 1, "KeyCode '" + keyCode + "' pressed on FilterField with label '" + sText + "'");
				}
			});
		},

		iPressKeyOnMTableRow: function(iIndex, keyCode) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.ColumnListItem",
				success:function(aRows) {
					new PressKey({
						keyCode: keyCode
					}).executeOn(aRows[iIndex]);
				}
			});
		},

		iPressOnMTableRow: function(iIndex) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.ColumnListItem",
				success:function(aRows) {
					new Press({
					}).executeOn(aRows[iIndex]);
					Opa5.assert.ok(1, "Pressed mTableItem with index: " + iIndex);
				}
			});
		},


		iSelectMdcResponsiveTableItem: function(sItemText) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.ColumnListItem",
				matchers: function (oItem) {
					var oCell = oItem.getCells()[1];
					var sText = oCell && oCell.getText && oCell.getText();
					var sValue = oCell && oCell.getValue && oCell.getValue();
					return sItemText === (sText || sValue);
				},
				//actions: new Press(),
				success: function (aResults) {
					aResults[0].setSelected(true);
					aResults[0].getParent().getParent().getParent()._fireSelectionChange(true);
					Opa5.assert.ok(1, "Set selected:true on m.table item with text:" + sItemText);

				}
			});
		},

		iPressButtonWithText: function (sText) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: "sap.m.Button",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: sText
				}),
				actions: new Press(),
				success:function(aResults) {
					Opa5.assert.equal(aResults.length, 1, "Button with text '" + sText + "' clicked successfully");
				}
			});
		},

		iCloseTheDialog: function() {
			return this.waitFor({
				controlType: "sap.m.Dialog",
				success:function(aDialogs) {
					new PressKey({
						keyCode: KeyCodes.ESCAPE
					}).executeOn(aDialogs[0]);
					Opa5.assert.equal(aDialogs.length, 1, "Dialog closed successfully");
				}
			});
		}
	});

	return Action;
}, true);
