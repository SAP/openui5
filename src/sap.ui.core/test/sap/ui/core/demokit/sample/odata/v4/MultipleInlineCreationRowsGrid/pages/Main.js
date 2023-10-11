/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties"

], function (Helper, Opa5, Press, Ancestor, Properties) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.Main";

	Opa5.createPageObjects({
		onAnyTable : {
			assertions : {
				checkMessageStrip : function (sTableId, sExpectedMessageType) {
					this.waitFor({
						controlType : "sap.m.Table",
						id : sTableId,
						success : function (oTable) {
							this.waitFor({
								controlType : "sap.m.MessageStrip",
								matchers : new Ancestor(oTable),
								success : function (aControls) {
									var oMessageStrip = aControls[0];

									if (oMessageStrip.getVisible()) {
										Opa5.assert.strictEqual(oMessageStrip.getType(),
											sExpectedMessageType,
											"Message strip in table " + sTableId
											+ " shows correct message type: "
											+ sExpectedMessageType);
									} else {
										Opa5.assert.strictEqual(sExpectedMessageType, undefined,
											"Message strip in table " + sTableId + " is invisible");
									}
								},
								viewName : sViewName,
								visible : false
							});
						},
						viewName : sViewName
					});
				}
			}
		},
		onTheListReport : {
			actions : {
				enterProductId : function (iRow, sId, bPressSave) {
					Helper.changeInputValue(this, sViewName, /productId/, sId, iRow);
					if (bPressSave) {
						Helper.pressButton(this, sViewName, "save");
					}
				},
				enterProductName : function (iRow, sProductName, bPressSave) {
					Helper.changeInputValue(this, sViewName, /name/, sProductName, iRow);
					if (bPressSave) {
						Helper.pressButton(this, sViewName, "save");
					}
				},
				pressRefresh : function () {
					Helper.pressButton(this, sViewName, "refresh");
				},
				pressResetButton : function (sId) {
					Helper.pressButton(this, sViewName, "reset" + sId);
				},
				selectProduct : function (iRow) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.ColumnListItem",
						id : /highlight/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.ok(true, "Product selected: "
								+ aControls[0].getCells()[2].getValue());
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkProduct : function (iRow, sExpectedProductId, sExpectedState, sExpectedName) {
					Helper.waitForSortedByID(this, {
						autoWait : false, // to match also disabled delete buttons
						matchers : function (oControl) {
							return oControl.getBindingContext()
								&& oControl.getBindingContext().getIndex() === iRow;
						},
						id : /productDelete|productId|productState|name/,
						success : function (aControls) {
							var sName = aControls[0].getValue(),
								bDeletable = aControls[1].getEnabled(),
								sProductId = aControls[3].getValue(),
								sState = aControls[4].getTooltip();

							// productDelete also matches its img
							Opa5.assert.strictEqual(aControls.length, 5, "exactly 5 controls");
							Opa5.assert.strictEqual(sProductId, sExpectedProductId,
								"Row: " + iRow + ", Product ID: " + sProductId);
							Opa5.assert.strictEqual(bDeletable, sExpectedState !== "Inactive"
									|| aControls[1].getTooltip() === "Reset",
								"Row: " + iRow + ", deletable: " + bDeletable);
							Opa5.assert.strictEqual(sState, sExpectedState,
								"Row: " + iRow + ", state: " + sState);
							if (sExpectedName) {
								Opa5.assert.strictEqual(sName, sExpectedName,
									"Row: " + iRow + ", name: " + sName);
							}
						},
						viewName : sViewName
					});
				},
				checkProductsLength : function (iExpectedLength) {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "products",
						success : function (oProductsTable) {
							Opa5.assert.strictEqual(
								oProductsTable.getBinding("items").getLength(),
								iExpectedLength,
								"Products length is: " + iExpectedLength);
						},
						viewName : sViewName
					});
				},
				checkProductsTableTitle : function (sTableTitle) {
					this.waitFor({
						controlType : "sap.m.Title",
						id : "productsTitle",
						success : function (oTitle) {
							Opa5.assert.ok(oTitle.getText(), sTableTitle);
						},
						viewName : sViewName
					});
				}
			}
		},
		onTheObjectPage : {
			actions : {
				confirmDeletion : function () {
					this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({title : "Confirm Deletion"}),
						success : function (aControls) {
							new Press().executeOn(aControls[0].getButtons()[0]);
							Opa5.assert.ok(true, "Confirm Deletion");
						}
					});
				},
				enterPartId : function (iRow, sId, bPressSave) {
					Helper.changeInputValue(this, sViewName, /partId/, sId, iRow);
					if (bPressSave) {
						Helper.pressButton(this, sViewName, "save");
					}
				},
				enterPartDescription : function (iRow, sId) {
					Helper.changeInputValue(this, sViewName, /description/, sId, iRow);
				},
				toggleMessageFilter : function () {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "parts",
						success : function (oTable) {
							this.waitFor({
								actions : new Press(),
								matchers : new Ancestor(oTable),
								controlType : "sap.m.Link",
								success : function (aLinks) {
									Opa5.assert.ok(true, "Link pressed: " + aLinks[0].getText());
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				pressCancel : function () {
					Helper.pressButton(this, sViewName, "cancel");
				},
				pressResetButton : function (sId) {
					Helper.pressButton(this, sViewName, "reset" + sId);
				},
				pressResetOrDeletePartButton : function (iRow) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : /partDelete/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.ok(true, "Button pressed: " + aControls[0].getTooltip());
						},
						viewName : sViewName
					});
				},
				pressSortPartsQuantity : function () {
					Helper.pressButton(this, sViewName, "sortByPartsQuantity");
				}
			},
			assertions : {
				checkPartIDValueState : function (sValueState, iRow) {
					Helper.checkValueState(this, sViewName, /partId-__clone/, sValueState,
						undefined, false, iRow || 0);
				},
				checkPartsLength : function (iExpectedLength) {
					this.waitFor({
						controlType : "sap.ui.table.Table",
						id : "parts",
						success : function (oPartsTable) {
							Opa5.assert.strictEqual(
								oPartsTable.getBinding("rows").getLength(),
								iExpectedLength,
								"Parts length is: " + iExpectedLength);
						},
						viewName : sViewName
					});
				},
				checkPartsTableTitle : function (sTableTitle) {
					this.waitFor({
						controlType : "sap.m.Title",
						id : "partsTitle",
						success : function (oTitle) {
							Opa5.assert.ok(oTitle.getText(), sTableTitle);
						},
						viewName : sViewName
					});
				},
				checkPart : function (iRow, sExpectedPartId, sExpectedState, sExpectedDescription) {
					Helper.waitForSortedByID(this, {
						autoWait : false, // to match also disabled delete buttons
						matchers : function (oControl) {
							return oControl.getBindingContext()
								&& oControl.getBindingContext().getIndex() === iRow;
						},
						id : /partDelete|partId|partState|description/,
						success : function (aControls) {
							var sDescription = aControls[0].getValue(),
								bDeletable = aControls[1].getEnabled(),
								sPartId = aControls[2].getValue(),
								sState = aControls[3].getTooltip();

							Opa5.assert.strictEqual(aControls.length, 4, "exactly 4 controls");
							Opa5.assert.strictEqual(sPartId, sExpectedPartId,
								"Row: " + iRow + ", Part ID: " + sPartId);
							Opa5.assert.strictEqual(bDeletable, sExpectedState !== "Inactive"
									|| aControls[1].getTooltip() === "Reset",
								"Row: " + iRow + ", deletable: " + bDeletable);
							Opa5.assert.strictEqual(sState, sExpectedState,
								"Row: " + iRow + ", state: " + sState);
							if (sExpectedDescription) {
								Opa5.assert.strictEqual(sDescription, sExpectedDescription,
									"Row: " + iRow + ", description: " + sDescription);
							}
						},
						viewName : sViewName
					});
				},
				checkPartIdErrorState : function (iRow, sMessage) {
					Helper.checkValueState(this, sViewName, /partId/, "Error", sMessage, false,
						iRow);
				}
			}
		}
	});
});
