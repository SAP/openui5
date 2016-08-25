/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties"
],
function (Opa5, EnterText, Press, BindingPath, Interactable, Properties) {
	"use strict";
	var ID_COLUMN_INDEX = 0,
		NOTE_COLUMN_INDEX = 5,
		sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main",
		sLastNewNoteValue;

	Opa5.createPageObjects({
		/*
		 * Actions and assertions for the "Create Sales Order" dialog
		 */
		onTheCreateNewSalesOrderDialog : {
			actions : {
				changeNote : function (sNewNoteValue) {
					return this.waitFor({
						actions: new EnterText({ clearTextFirst : true, text: sNewNoteValue }),
						controlType : "sap.m.Input",
						id : "NewNote",
						success : function (oNewNoteInput) {
							Opa5.assert.ok(true, "Note text set to " + sNewNoteValue);
						},
						viewName : sViewName
					});
				},
				confirmDialog : function () {
					return this.waitFor({
						actions: new Press(),
						controlType : "sap.m.Button",
						id : "confirmCreateSalesOrder",
						success : function (oNewNoteInput) {
							Opa5.assert.ok(true, "Create Sales Order dialog confirmed");
						},
						viewName : sViewName
					});
				}

			},
			assertions : {
				checkNewBuyerId : function (sExpectedBuyerID) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "NewBuyerID",
						success : function (oNewBuyerIDInput) {
							Opa5.assert.strictEqual(oNewBuyerIDInput.getValue(), sExpectedBuyerID,
								"New Buyer ID");
						},
						viewName : sViewName
					});
				},
				// store note value in sLastNewNoteValue and check note value if sExpectedNote is
				// not empty
				checkNewNote : function (sExpectedNote) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "NewNote",
						success : function (oNewNoteInput) {
							sLastNewNoteValue = oNewNoteInput.getValue();
							if (sExpectedNote) {
								Opa5.assert.strictEqual(oNewNoteInput.getValue(), sExpectedNote,
									"New Note");
							} else {

								Opa5.assert.ok(true, "Stored NewNote value " + sLastNewNoteValue);
							}
						},
						viewName : sViewName
					});
				}
			}
		},
		/*
		 * Actions and assertions for the main view of the Sales Orders application
		 */
		onTheMainPage : {
			actions : {
				changeNote : function (iRow, sNewNoteValue) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							oRow.getCells()[NOTE_COLUMN_INDEX].setValue(sNewNoteValue);
							Opa5.assert.ok(true,
								"Note of row " + iRow + " set to " + sNewNoteValue);
						},
						viewName : sViewName
					});
				},
				deleteSelectedSalesOrder : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "deleteSalesOrder",
						viewName : sViewName
					});
				},
				firstSalesOrderIsVisible : function () {
					return this.waitFor({
						controlType : "sap.m.Text",
						matchers : new BindingPath({path: "/SalesOrderList/0"}),
						success : function (oControl) {
							var oCore = Opa5.getWindow().sap.ui.getCore(),
								sSalesOrderId = oCore.byId(sViewName).byId("SalesOrders")
									.getItems()[0].getCells()[0].getText();
							sap.ui.test.Opa.getContext().firstSalesOrderId = sSalesOrderId;
							Opa5.assert.ok(true, "First SalesOrderID " + sSalesOrderId);

						}
					});
				},
				pressCreateSalesOrdersButton : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						id : "createSalesOrder",
						success : function (oCreateSalesOrderButton) {
							oCreateSalesOrderButton.$().trigger("tap");
						},
						viewName : sViewName
					});
				},
				pressRefreshSalesOrdersButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "refreshSalesOrders",
						viewName : sViewName,
						success : function (aControls) {
							Opa5.assert.ok(true, "Sales Orders refreshed");
						}
					});
				},
				pressSaveSalesOrdersButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "saveSalesOrders",
						viewName : sViewName
					});
				},
				selectSalesOrderWithId : function (sSalesOrderId) {
					return this.waitFor({
						id : /SalesOrders_ID/,
						viewName : sViewName,
						controlType : "sap.m.Text",
						matchers : new Properties({text: sSalesOrderId}),
						success : function (aControls) {
							aControls[0].$().tap();
							Opa5.assert.ok(true, "Sales Order selected: " + sSalesOrderId);
						}
					});
				}

			},
			assertions: {
				checkLog : function () {
					return this.waitFor({
						success : function (oControl) {
							Opa5.getWindow().jQuery.sap.log.getLogEntries()
								.forEach(function (oLog) {
									var sComponent = oLog.component || "";

									if ((sComponent.indexOf("sap.ui.model.odata.v4.") === 0
											|| sComponent.indexOf("sap.ui.model.odata.type.") === 0)
											&& oLog.level <= jQuery.sap.log.Level.WARNING) {
										Opa5.assert.ok(false,
												"Warning or error found: " + sComponent
												+ " Level: " + oLog.level
												+ " Message: " + oLog.message );
									}
								});
							Opa5.assert.ok(true, "Log checked");
						}
					});
				},
				checkDifferentID : function (iRow, sExpectedID) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							Opa5.assert.notStrictEqual(oRow.getCells()[ID_COLUMN_INDEX].getText(),
								sExpectedID,
								"ID of row " + iRow + " is not \"" + sExpectedID + "\"");
						},
						viewName : sViewName
					});
				},
				checkID : function (iRow, sExpectedID) {
					var that = this;
					return this.waitFor({
						controlType : "sap.m.Button",
						// we wait for the refresh button becomes interactable before checking the
						// Sales Orders list
						matchers : new Interactable(),
						id : "refreshSalesOrders",
						success : function (oSalesOrderTable) {
							return that.waitFor({
								controlType : "sap.m.Table",
								id : "SalesOrders",
								success : function (oSalesOrderTable) {
									var oRow = oSalesOrderTable.getItems()[iRow];
									if (sExpectedID === undefined) {
										//compare with initial OrderID
										sExpectedID =
											sap.ui.test.Opa.getContext().firstSalesOrderId;
									}
									Opa5.assert.strictEqual(
										oRow.getCells()[ID_COLUMN_INDEX].getText(),
										sExpectedID,
										"ID of row " + iRow + " as expected \""
											+ sExpectedID + "\"");
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				checkNote : function (iRow, sExpectedNote) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							var oRow = oSalesOrderTable.getItems()[iRow];

							sExpectedNote = sExpectedNote || sLastNewNoteValue;
							Opa5.assert.strictEqual(oRow.getCells()[NOTE_COLUMN_INDEX].getValue(),
								sExpectedNote,
								"Note of row " + iRow + " as expected " + sExpectedNote);
						},
						viewName : sViewName
					});
				}
			}
		},
		/*
		 * Actions and assertions for the "Sales Order Deletion" confirmation dialog
		 */
		onTheSalesOrderDeletionConfirmation : {
			actions : {
				cancel : function () {
					return this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({title : "Sales Order Deletion"}),
						success : function (aControls) {
							aControls[0].getButtons()[1].$().tap(); // cancel deletion
							Opa5.assert.ok(true, "Cancel Delete Sales Order");
						}
					});
				},
				confirm : function () {
					return this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({title : "Sales Order Deletion"}),
						success : function (aControls) {
							aControls[0].getButtons()[0].$().tap(); // confirm deletion
							Opa5.assert.ok(true, "Confirm Delete Sales Order");
						}
					});
				}
			},
			assertions : {}
		},
		/*
		 * Actions and assertions for the "Success" information dialog
		 */
		onTheSuccessInfo : {
			actions : {
				confirm : function () {
					return this.waitFor({
						controlType : "sap.m.Dialog",
						matchers : new Properties({title : "Success"}),
						success : function (aControls) {
							aControls[0].getButtons()[0].$().tap(); // confirm info
							Opa5.assert.ok(true, "Success Info");
						}
					});
				}
			},
			assertions : {}
		}
	});
});