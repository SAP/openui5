/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/TestUtils"
], function (jQuery, Opa5, Press, Interactable, Properties, TestUtils) {
	"use strict";

	return {
		typeDeterminationAndDelete : function (Given, When, Then) {
			var oExpectedLogChangeSetID = {
					component : "sap.ui.test.TestUtils",
					level : jQuery.sap.log.Level.ERROR,
					message : "--changeset_id-",
					details : "No mock data found"
				},
				bRealOData = TestUtils.isRealOData(),
				sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main";

			// close schedules dialog
			function closeSchedules() {
				When.waitFor({
					actions : new Press(),
					controlType : "sap.m.Button",
					matchers : new Properties({icon : "sap-icon://sys-cancel-2"}),
					success : function (aControls) {
						Opa5.assert.ok(true, "Schedules Dialog closed");
					},
					viewName : sViewName
				});
			}

			// delete selected schedules
			function deleteSchedules() {
				When.waitFor({
					id : "deleteSalesOrderSchedules",
					viewName : sViewName,
					controlType : "sap.m.Button",
					success : function (oButton) {
						oButton.$().tap();
					}
				});

				Then.waitFor({
					controlType : "sap.m.Dialog",
					matchers : new Properties({icon : "sap-icon://message-success"}),
					success : function (aControls) {
						aControls[0].getButtons()[0].$().tap(); // confirm deletion
						Opa5.assert.ok(true, "Deleted all selected Schedules");
					}
				});
			}

			// Click on deleteBusinessPartner button, confirm the success dialog
			function deleteBusinessPartner() {
				When.waitFor({
					controlType : "sap.m.Button",
					id : "deleteBusinessPartner",
					viewName : sViewName,
					success : function (oButton) {
						oButton.$().tap();
					}
				});

				Then.waitFor({
					controlType : "sap.m.Dialog",
					matchers : new Properties({icon : "sap-icon://message-success"}),
					success : function (aControls) {
						aControls[0].getButtons()[0].$().tap(); // confirm success
						Opa5.assert.ok(true, "Business Partner deleted");
					}
				});
			}

			// Click on deleteSalesOrder button, confirm the deletion and the successful deletion
			// dialog
			function deleteSelectedSalesOrder() {
				When.waitFor({
					actions : new Press(),
					controlType : "sap.m.Button",
					id : "deleteSalesOrder",
					viewName : sViewName
				});

				When.waitFor({
					controlType : "sap.m.Dialog",
					matchers : new Properties({title : "Sales Order Deletion"}),
					success : function (aControls) {
						aControls[0].getButtons()[0].$().tap(); // confirm deletion
					}
				});

				Then.waitFor({
					controlType : "sap.m.Dialog",
					matchers : new Properties({icon : "sap-icon://message-success"}),
					success : function (aControls) {
						aControls[0].getButtons()[0].$().tap(); // confirm success
						Opa5.assert.ok(true, "Selected Sales Order deleted");
					}
				});
			}


			// click on more button within sales orders table
			function moreSalesOrders() {
				When.waitFor({
					controlType : "sap.m.CustomListItem",
					id : /SalesOrders-trigger/,
					matchers : new Interactable(),
					success : function (aControls) {
						aControls[0].$().tap();
						Opa5.assert.ok(true, "'More' Button pressed");
					}
				});
			}
			// mark given schedules
			function markSchedules(aSchedules) {
				if (!aSchedules) {
					// select all
					When.waitFor({
						id : "SalesOrderSchedules-sa",
						viewName : sViewName,
						controlType : "sap.m.CheckBox",
						success : function (oCheckBox) {
							oCheckBox.$().tap();
							Opa5.assert.ok(true, "All Schedules selected");
						}
					});
				} else {
					When.waitFor({
						searchOpenDialogs : true,
						id : "/SalesOrdersSchedules-/",
						viewName : sViewName,
						controlType : "sap.m.ColumnListItem",
						success : function (aListItems) {
							aListItems.forEach(function(oListItem){
								aSchedules.forEach(function(sSchedule) {
									var sKey = oListItem.getCells()[0].getText();
									if (sKey === sSchedule) {
										oListItem.getMultiSelectControl().$().tap();
										Opa5.assert.ok(true, "Schedule '" + sKey + "' selected");
									}
								} );
							});
						}
					});
				}
			}

			// Click on deleteSalesOrder button, confirm the deletion and the successful deletion
			// dialog
			function openSchedules() {
				When.waitFor({
					actions : new Press(),
					controlType : "sap.m.Button",
					id : "showSalesOrderSchedules",
					viewName : sViewName
				});

				When.waitFor({
					searchOpenDialogs : true,
					controlType : "sap.m.Dialog",
					id : "SalesOrderSchedulesDialog",
					success : function (aControls) {
						//aControls[0].getButtons()[0].$().tap(); // confirm deletion
						Opa5.assert.ok(true, "'Schedules' opened");
					}
				});
			}

			// find the sales order with given Id and click on it to select the sales order
			function selectSalesOrderWithId(sSalesOrderId) {
				When.waitFor({
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

			// check 'More' button visibility
			function verifyMoreButton(bVisible) {
				Then.waitFor({
					controlType : "sap.m.CustomListItem",
					id : /SalesOrders-trigger/,
					visible : false,
					check: function(aControls) {
						return aControls[0].$().is(":visible") === bVisible;
					},
					success : function (aControls) {
						Opa5.assert.ok(true,
								bVisible ? "'More' Button visible" : "'More' Button invisible");
					},
					errorMessage : bVisible ?
							"'More'-Button not visible" : "'More'-Button still visible"
				});
			}

			function verifyTypeDetermination() {
				Then.waitFor({
					controlType : "sap.m.Table",
					id : "SalesOrders",
					check : function (oSalesOrderTable) {
						return  oSalesOrderTable.getItems().length > 0;
					},
					success : function (oSalesOrderTable) {
						var sTypeName,
						oView = sap.ui.getCore().byId(sViewName);

						// check for valid automatic type determination for each cell content in 1st
						// row
						oView.byId("SalesOrders").getItems()[0].getCells()
							.forEach(function (oCell) {
								var oBinding = oCell.getBinding("text");

								if (!oBinding) {
									return;
								}
								sTypeName = oBinding.getType() ? oBinding.getType().getName() : "";
								Opa5.assert.strictEqual(
									sTypeName.indexOf("sap.ui.model.odata.type"), 0, "Binding: "
									+ oBinding.getPath() + " has ODataType: " + sTypeName
								);
						});

					},
					errorMessage : "No data row found. Data from service could not be retrieved?",
					viewName : sViewName
				});
			}

			// verify visible sales order IDs
			function verifyVisibleSalesOrderIds(aExpectedSalesOrderIds, sMessage) {
				Then.waitFor({
					controlType : "sap.m.Text",
					// sales order IDs are in controls with ID "SalesOrders_ID"
					id : /--SalesOrders_ID-/,
					success : function () {
						var aSalesOrderIds = sap.ui.getCore().byId(sViewName).byId("SalesOrders")
								.getItems().map(function (oItem) {
									return oItem.getCells()[0].getText();
							});
						Opa5.assert.deepEqual(aSalesOrderIds, aExpectedSalesOrderIds, sMessage);
					}
				});
			}

			// verify visible schedules
			function verifyVisibleSchedules(aExpectedScheduleIds) {
				Then.waitFor({
					searchOpenDialogs : true,
					id : "SalesOrdersSchedules",
					viewName : sViewName,
					controlType : "sap.m.Table",
					check : function (oTable) {
						return oTable[0].getItems().length === aExpectedScheduleIds.length;
					},
					success : function () {
						var oCore = sap.ui.getCore(),
						aScheduleIds = [];

						oCore.byId(sViewName).byId("SalesOrderSchedules")
							.getItems().forEach(function (oItem, i) {
								aScheduleIds.push(oItem.getCells()[0].getText());
							});
						Opa5.assert.deepEqual(aScheduleIds, aExpectedScheduleIds,
							"Verify Schedules");
					}
				});
			}

			//*****************************************************************************
			// Check type determination

			verifyTypeDetermination();

			if (bRealOData) {
				Opa5.assert.ok(true, "Deletion test skipped because unstable real keys");
			} else {

				//*****************************************************************************
				// Single Deletion Journey (within Sales Orders List, refetch on delete, more
				// button)

				verifyVisibleSalesOrderIds([
					"0500000000", "0500000001", "0500000002", "0500000003", "0500000004"
				], "Sales Orders before delete as expected");
				verifyMoreButton(true);

				// delete one SO
				selectSalesOrderWithId("0500000002");
				deleteSelectedSalesOrder();

				// check that one SO is re-fetched
				verifyVisibleSalesOrderIds([
					"0500000000", "0500000001", "0500000003", "0500000004", "0500000005"
				], "Sales Orders after delete as expected");
				verifyMoreButton(true);

				// fetch more
				moreSalesOrders();

				// verify that we got 10 orders
				verifyVisibleSalesOrderIds([
					"0500000000", "0500000001", "0500000003", "0500000004", "0500000005",
					"0500000006", "0500000007", "0500000008", "0500000009"
				], "Further Sales Orders visible");
				// and the more button is gone
				verifyMoreButton(false);

				selectSalesOrderWithId("0500000003");
				deleteSelectedSalesOrder();

				// verify that we got 9 orders
				verifyVisibleSalesOrderIds([
					"0500000000", "0500000001", "0500000004", "0500000005",
					"0500000006", "0500000007", "0500000008", "0500000009"
				], "No further Sales Orders");
				verifyMoreButton(false);

				selectSalesOrderWithId("0500000004");
				deleteSelectedSalesOrder();

				// verify that 8 orders are left
				verifyVisibleSalesOrderIds([
					"0500000000", "0500000001", "0500000005",
					"0500000006", "0500000007", "0500000008", "0500000009"
				], "Only 7 Sales Orders left");

				//*****************************************************************************
				// Multiple Deletion Journey within Schedules
				// TODO: take care about TestUtils log message like this:
				//   "changeset_id-1490715882516-48 - No mock data found sap.ui.test.TestUtils"
				//   support changesets in $batch caused by multiple deletion requests

				selectSalesOrderWithId("0500000005");

				openSchedules();
				verifyVisibleSchedules(["005056A71E3D1ED68DDAAE99B0154B70",
					"005056A71E3D1ED68DDAAE99B0156B70",
					"005056A71E3D1ED68DDAAE99B0158B70",
					"005056A71E3D1ED68DDAAE99B015AB70",
					"005056A71E3D1ED68DDAAE99B015CB70",
					"005056A71E3D1ED68DDAAE99B015EB70",
					"005056A71E3D1ED68DDAAE99B0160B70",
					"005056A71E3D1ED68DDAAE99B0162B70",
					"005056A71E3D1ED68DDAAE99B0164B70",
					"005056A71E3D1ED68DDAAE99B0166B70"
				]);

				// mark and delete some Schedules
				markSchedules(["005056A71E3D1ED68DDAAE99B0158B70",
					"005056A71E3D1ED68DDAAE99B015CB70"]);
				deleteSchedules();
				verifyVisibleSchedules(["005056A71E3D1ED68DDAAE99B0154B70",
					"005056A71E3D1ED68DDAAE99B0156B70",
					"005056A71E3D1ED68DDAAE99B015AB70",
					"005056A71E3D1ED68DDAAE99B015EB70",
					"005056A71E3D1ED68DDAAE99B0160B70",
					"005056A71E3D1ED68DDAAE99B0162B70",
					"005056A71E3D1ED68DDAAE99B0164B70",
					"005056A71E3D1ED68DDAAE99B0166B70"
				]);

				// mark and delete all remaining Schedules
				markSchedules();
				deleteSchedules();
				verifyVisibleSchedules([]);

				closeSchedules();

				//*****************************************************************************
				// Delete BusinessPartner via Context Binding
				deleteBusinessPartner();

			}
			Then.onAnyPage.checkLog(!bRealOData ?
				[oExpectedLogChangeSetID, oExpectedLogChangeSetID] : undefined);
		}
	};
});
