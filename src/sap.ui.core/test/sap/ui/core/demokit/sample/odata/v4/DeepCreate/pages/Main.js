/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils",
	"sap/ui/test/actions/Press"
], function (Helper, Opa, Opa5, TestUtils, Press) {
	"use strict";
	var sListReport = "sap.ui.core.sample.odata.v4.DeepCreate.ListReport",
		sObjectPage = "sap.ui.core.sample.odata.v4.DeepCreate.ObjectPage";

	Opa5.createPageObjects({
		onTheListReport : {
			actions : {
				pressCreate : function () {
					Helper.pressButton(this, sListReport, "create");
					if (TestUtils.isRealOData()) {
						// remember created sales order for cleanup
						this.waitFor({id : "objectPage",
							success : function (oControl) {
								var oCreated = oControl.getBindingContext();

								oCreated.created().then(function () {
									var aCreatedEntityPaths = Opa.getContext().aCreatedEntityPaths,
										sPath = oCreated.getPath();

									if (!aCreatedEntityPaths) {
										Opa.getContext().aCreatedEntityPaths
											= aCreatedEntityPaths = [];
									}
									aCreatedEntityPaths.push(sPath);
									Opa5.assert.ok(true, "Remembered SalesOrder: " + sPath);
								}, function () { /* ignore */ });
							},
							viewName : sObjectPage});
					}
				}
			}
		},
		onTheObjectPage : {
			actions : {
				changeNote : function (sNote) {
					Helper.changeInputValue(this, sObjectPage, "SalesOrder::note", sNote);
				},
				pressCreateLineItem : function () {
					Helper.pressButton(this, sObjectPage, "createLineItem");
				},
				pressDeleteSelectedLineItems : function () {
					Helper.pressButton(this, sObjectPage, "deleteLineItem");
				},
				pressResetChanges : function () {
					Helper.pressButton(this, sObjectPage, "resetChanges");
				},
				pressSave : function () {
					Helper.pressButton(this, sObjectPage, "save");
				},
				pressValueHelpOnProductID : function (iRow) {
					this.waitFor({
						actions : function (oControl) {
							new Press().executeOn(oControl.getAggregation("field"));
						},
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						controlType : "sap.ui.core.sample.common.ValueHelp",
						id : /SO_2_SOITEM:ProductID/,
						success : function (oControls) {
							Opa5.assert.ok(true, "ValueHelp pressed: " + oControls[0].getValue());
						},
						viewName : sObjectPage
					});
				},
				selectLineItem : function (iRow) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.CheckBox",
						id : /selectMulti/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							aControls.forEach(function (oControl) {
								Opa5.assert.ok(true, "Item selected: "
									+ oControl.getBindingContext());
							});
						},
						viewName : sObjectPage
					});
				}
			},
			assertions : {
				checkGrossAmount : function (sGrossAmount) {
					Helper.checkInputValue(this, sObjectPage, "SalesOrder::grossAmount",
						sGrossAmount);
				},
				checkSalesOrderID : function (sSalesOrderID) {
					Helper.checkInputValue(this, sObjectPage, "SalesOrder::id", sSalesOrderID);
				},
				checkSalesOrderItemsCount : function (iCount) {
					Helper.waitForSortedByID(this, {
						id : /SO_2_SOITEM-trigger|lineItemsTitle/,
						success : function (aControls) {
							if (aControls.length === 2) {
								Helper.checkMoreButtonCount(aControls.shift(),
									"[5/" + iCount + "]");
							}
							Opa5.assert.strictEqual(aControls[0].getText(),
								iCount + " Sales Order Line Items", "Count in title is " + iCount);
						},
						viewName : sObjectPage
					});
				}
			}
		}
	});
});
