/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/TestUtils"
],
function (_Requestor, Opa5, EnterText, Press, BindingPath, Interactable, Properties, TestUtils) {
	"use strict";
	var ID_COLUMN_INDEX = 0,
		NOTE_COLUMN_INDEX = 5,
		sLastNewNoteValue,
		sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main";

	function handleMessageBox(oOpa, sTitle, bConfirm, sLog) {
		return oOpa.waitFor({
			controlType : "sap.m.Dialog",
			matchers : new Properties({title : sTitle}),
			success : function (aControls) {
				aControls[0].getButtons()[bConfirm ? 0 : 1].$().tap();
				Opa5.assert.ok(true, sLog || (bConfirm ? 'Confirm ' : 'Cancel ') + sTitle);
			}
		});
	}

	Opa5.extendConfig({autoWait : true});

	Opa5.createPageObjects({
		/*
		 * Actions and assertions for the "Create Sales Order" dialog
		 */
		onTheCreateNewSalesOrderDialog : {
			actions : {
				changeNote : function (sNewNoteValue) {
					return this.waitFor({
						actions : new EnterText({ clearTextFirst : true, text : sNewNoteValue }),
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
						actions : new Press(),
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
		 * Actions and assertions for the "Error" information dialog
		 */
		onTheErrorInfo : {
			actions : {
				confirm : function () {
					return handleMessageBox(this, "Error", true, "Confirm 'Error'");
				}
			},
			assertions : {}
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
				filterGrossAmount : function (sFilterValue) {
					return this.waitFor({
						actions: new EnterText({clearTextFirst : true, text : sFilterValue}),
						controlType : "sap.m.SearchField",
						id : "filterGrossAmount",
						success : function (oSearchField) {
							Opa5.assert.ok(true, "Filter by GrossAmount:" + sFilterValue);
						},
						viewName : sViewName
					});
				},
				firstSalesOrderIsVisible : function () {
					return this.waitFor({
						controlType : "sap.m.Text",
						matchers : new BindingPath({path : "/SalesOrderList/0"}),
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
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "createSalesOrder",
						success : function (oCreateSalesOrderButton) {
							Opa5.assert.ok(true, "Create Sales Order button pressed");
						},
						viewName : sViewName
					});
				},
				pressRefreshAllButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "refreshAll",
						success : function (aControls) {
							Opa5.assert.ok(true, "Refresh All pressed");
						},
						viewName : sViewName
					});
				},
				pressRefreshSalesOrdersButton : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "refreshSalesOrders",
						success : function (aControls) {
							Opa5.assert.ok(true, "Refresh Sales Orders pressed");
						},
						viewName : sViewName
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
				rememberCreatedSalesOrder : function () {
					return this.waitFor({
						controlType : "sap.m.Text",
						matchers : new BindingPath({path : "/SalesOrderList/0"}),
						success : function (oControl) {
							var oCore = Opa5.getWindow().sap.ui.getCore(),
								sSalesOrderId = oCore.byId(sViewName).byId("SalesOrders")
									.getItems()[0].getCells()[0].getText();
							if (!sap.ui.test.Opa.getContext().aOrderIds) {
								sap.ui.test.Opa.getContext().aOrderIds = [];
							}
							sap.ui.test.Opa.getContext().aOrderIds.push(sSalesOrderId);

							Opa5.assert.ok(true, "SalesOrderID remembered:" + sSalesOrderId);
						}
					});
				},
				selectSalesOrderWithId : function (sSalesOrderId) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : /--SalesOrders_ID-/,
						matchers : new Properties({text: sSalesOrderId}),
						success : function (aControls) {
							aControls[0].$().tap();
							Opa5.assert.ok(true, "Sales Order selected: " + sSalesOrderId);
						},
						viewName : sViewName
					});
				}
			},
			assertions: {
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
						id : "refreshSalesOrders",
						// we wait for the refresh button becomes interactable before checking the
						// Sales Orders list
						matchers : new Interactable(),
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
				checkNote : function (iRow, sExpectedNote) {
					return this.waitFor({
						controlType : "sap.m.Table",
						autoWait : false,
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
				},
				cleanUp : function() {
					return this.waitFor({
						controlType : "sap.m.Table",
						autoWait : false,
						id : "SalesOrders",
						success : function (oSalesOrderTable) {
							var aPromises = [],
								bCleanUpFinished = false,
								// use private requestor to prevent additional read requests(ETag)
								// which need additional mockdata
								oRequestor = oSalesOrderTable.getModel().oRequestor;
							sap.ui.test.Opa.getContext().aOrderIds.forEach(function (sOrderId) {
								aPromises.push(oRequestor.request("DELETE",
									"SalesOrderList('" + sOrderId + "')", "Cleanup",
									{"If-Match" : "*"}));
								Opa5.assert.ok(true, "Cleanup; delete SalesOrder:" + sOrderId);
							});
							oRequestor.submitBatch("Cleanup").then(function () {
								Opa5.assert.ok(true, "Cleanup finished");
								bCleanUpFinished = true;
							}, function (oError) {
								Opa5.assert.ok(false, "Cleanup failed: " + oError.message);
								bCleanUpFinished = true;
							});
							return this.waitFor({
								check : function() {
									return bCleanUpFinished;
								}
							});
						},
						viewName : sViewName
					});
				}
			}
		},
		/*
		 * Actions and assertions for the "Refresh" confirmation dialog
		 */
		onTheRefreshConfirmation : {
			actions : {
				cancel : function() {
					return handleMessageBox(this, "Refresh", false, "Cancel 'pending changes'");
				},
				confirm : function() {
					return handleMessageBox(this, "Refresh", true, "Confirm 'pending changes'");
				}
			},
			assertions : {}
		},
		/*
		 * Actions and assertions for the "Sales Order Deletion" confirmation dialog
		 */
		onTheSalesOrderDeletionConfirmation : {
			actions : {
				cancel : function () {
					return handleMessageBox(this, "Sales Order Deletion", false);
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
					return handleMessageBox(this, "Success", true, "Confirm 'Success'");
				}
			},
			assertions : {}
		}
	});
});