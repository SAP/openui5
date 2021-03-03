/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant"
], function (Opa5, Properties, Ancestor, Descendant) {
	"use strict";

	var _getUITableSelectionHandler = function (oTable) {
		var oSelectionPlugin = oTable.getPlugins().find(function (oPlugin) {
			return oPlugin.isA("sap.ui.table.plugins.SelectionPlugin");
		});

		return oSelectionPlugin || oTable;
	};

	var _getUITableItems = function (oTable, bSelectedOnly) {
		var aSelectedIndices = _getUITableSelectionHandler(oTable).getSelectedIndices();

		var aSelectedContexts = oTable._getContexts().filter(function (oContext, i) {
			return aSelectedIndices.indexOf(i) >= 0;
		});

		var aResult = oTable.getRows().filter(function (oRow) {
			var oRowBindingContext = oRow.getBindingContext();
			return oRowBindingContext && oRowBindingContext.getObject();	// don't return empty rows
		});
		if (bSelectedOnly) {
			aResult = aResult.filter(function (oRow) {
				return aSelectedContexts.indexOf(oRow.getBindingContext()) >= 0;
			});
		}
		return aResult;
	};

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
		iShouldSeeATableOfType: function (sType) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: sType,
				success: function (aResults) {
					Opa5.assert.equal(aResults.length, 1, "One Table with type '" + sType + "' found");
				}
			});
		},

		iShouldSeeAnEmptyTableOfType: function (sType) {
			return this.waitFor({
				searchOpenDialogs: true,
				controlType: sType,
				matchers: function (oTable) {
					return !(oTable.getMetadata().getName() === "sap.m.Table" ? oTable.getItems().length : oTable.getRows().length);
				},
				success: function (aResults) {
					Opa5.assert.equal(aResults.length, 1, "One empty Table with type '" + sType + "' found");
				}
			});
		},

		iShouldSeeUITableSelection: function (aItems) {
			aItems.forEach(function (oItem, iIndex) {
				this.waitFor({
					searchOpenDialogs: true,
					controlType: "sap.m.Text",
					matchers: {
						properties: {
							text: oItem
						}
					},
					success: function (aTexts) {
						this.waitFor({
							controlType: "sap.ui.table.Row",
							matchers: new Descendant(aTexts[0]),
							success: function (aRows) {
								var oTable = aRows[0].getParent();
								var aSelectedItems = _getUITableItems(oTable, true);
								Opa5.assert.ok(aSelectedItems.indexOf(aRows[0]) >= 0, "The item is selected. ");
							}
						});
					}
				});
			}.bind(this));
		},

		iShouldSeeMTableItems: function (aItems, iLength) {
			aItems.forEach(function (oItem, iIndex) {
				this.waitFor({
					searchOpenDialogs: true,
					controlType: "sap.m.ColumnListItem",
					matchers: function (oItem) {
						var oCell = oItem.getCells()[1];
						var sText = oCell && oCell.getText && oCell.getText();
						var sValue = oCell && oCell.getValue && oCell.getValue();
						return aItems.indexOf(sText || sValue) >= 0;
					},
					success: function (aResults) {
						Opa5.assert.ok(aItems.length === aResults.length, "The m.Table has these items: " + aItems.join(", "));
					}
				});
			}.bind(this));
		},

		iShouldSeeUITableItems: function (aItems) {
			aItems.forEach(function (oItem, iIndex) {
				this.waitFor({
					searchOpenDialogs: true,
					controlType: "sap.ui.table.Row",
					matchers: function (oItem) {
						var oCell = oItem.getCells()[1];
						var sText = oCell && oCell.getText && oCell.getText();
						var sValue = oCell && oCell.getValue && oCell.getValue();
						return aItems.indexOf(sText || sValue) >= 0;
					},
					success: function (aResults) {
						Opa5.assert.ok(aItems.length === aResults.length, "The ui.Table has these items: " + aItems.join(", "));
					}
				});
			}.bind(this));
		},

		iShouldSeeMTableSelection: function (aItems) {
			aItems.forEach(function (oItem, iIndex) {
				this.waitFor({
					searchOpenDialogs: true,
					controlType: "sap.m.Text",
					matchers: {
						properties: {
							text: oItem
						}
					},
					success: function (aTexts) {
						this.waitFor({
							controlType: "sap.m.ColumnListItem",
							matchers: new Descendant(aTexts[0]),
							success: function (aRows) {
								Opa5.assert.ok(aRows[0].getSelected(), "The item " + oItem + " is selected. ");
							}
						});
					}
				});
			}.bind(this));
		},

		iShouldSeeSelectedConditionOnFilterFieldWithLabel: function (sText, sCondition) {
			return this.waitFor({
				controlType: "sap.ui.mdc.field.FieldInput",
				matchers: {
					properties: {
						value: sCondition
					}
				},
				success:function(aFields) {
					return Opa5.assert.ok(aFields[0].getParent().getLabel() === sText , "FilterField with label '" + sText + "' and condition '" + sCondition + "' found");
				}
			});
		},

		iShouldSeeSelectedTokensOnFilterFieldWithLabel: function (sText, aTokenTexts) {
			return this.waitFor({
				controlType: "sap.ui.mdc.FilterField",
				matchers: {
					properties: {
						label: sText
					}
				},
				success: function(aFields) {
					var aTexts = aTokenTexts;
					var aTokens = aFields[0].getAggregation("_content")[0].getTokens();
					var aFilteredTokens = aTokens.filter(function (oToken, i) {
						return oToken.getText() === aTexts[i];
					});
					return Opa5.assert.equal(aTokens.length, aFilteredTokens.length, aTokens.length +  " Tokens found in filterField with Label");
				}
			});
		}
	});
	return Assertion;
}, true);
