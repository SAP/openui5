/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties"
], function (Element, Opa5, TestUtils, Press, Interactable, Properties) {
	"use strict";

	return {
		typeDeterminationAndDelete : function (Given, When, Then, sUIComponent) {
			var bRealOData = TestUtils.isRealOData(),
				sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main";

			// close schedules dialog
			function closeSchedules() {
				When.waitFor({
					actions : new Press(),
					controlType : "sap.m.Button",
					matchers : new Properties({icon : "sap-icon://sys-cancel-2"}),
					success : function () {
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
						new Press().executeOn(oButton);
					}
				});

				Then.waitFor({
					controlType : "sap.m.Dialog",
					matchers : new Properties({icon : "sap-icon://sys-enter-2"}),
					success : function (aControls) {
						new Press().executeOn(aControls[0].getButtons()[0]); // confirm deletion
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
						new Press().executeOn(oButton);
					}
				});

				Then.waitFor({
					controlType : "sap.m.Dialog",
					matchers : new Properties({icon : "sap-icon://sys-enter-2"}),
					success : function (aControls) {
						new Press().executeOn(aControls[0].getButtons()[0]); // confirm success
						Opa5.assert.ok(true, "Business Partner deleted");
					}
				});
			}

			// Click on deleteSalesOrder button and the saveSalesOrders button
			function deleteSelectedSalesOrder() {
				When.waitFor({
					actions : new Press(),
					controlType : "sap.m.Button",
					id : "deleteSalesOrder",
					viewName : sViewName
				});

				Then.waitFor({
					actions : new Press(),
					controlType : "sap.m.Button",
					id : "saveSalesOrders",
					viewName : sViewName
				});
			}

			// click on more button within sales orders table
			function moreSalesOrders() {
				When.waitFor({
					controlType : "sap.m.CustomListItem",
					id : /SalesOrderList-trigger/,
					matchers : new Interactable(),
					success : function (aControls) {
						new Press().executeOn(aControls[0]);
						Opa5.assert.ok(true, "'More' Button pressed");
					}
				});
			}
			// mark given schedules
			function markSchedules(aSchedules) {
				if (!aSchedules) {
					// select all
					When.waitFor({
						id : "SO_2_SCHDL-sa",
						viewName : sViewName,
						controlType : "sap.m.CheckBox",
						success : function (oCheckBox) {
							new Press().executeOn(oCheckBox);
							Opa5.assert.ok(true, "All Schedules selected");
						}
					});
				} else {
					When.waitFor({
						searchOpenDialogs : true,
						viewName : sViewName,
						controlType : "sap.m.ColumnListItem",
						success : function (aListItems) {
							aListItems.forEach(function (oListItem) {
								aSchedules.forEach(function (sSchedule) {
									var sKey = oListItem.getCells()[0].getText();

									if (sKey === sSchedule) {
										new Press().executeOn(oListItem.getMultiSelectControl());
										Opa5.assert.ok(true, "Schedule '" + sKey + "' selected");
									}
								});
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
					success : function () {
						//new Press().executeOn(aControls[0].getButtons()[0]); // confirm deletion
						Opa5.assert.ok(true, "'Schedules' opened");
					}
				});
			}

			// find the sales order with given Id and click on it to select the sales order
			function selectSalesOrderWithId(sSalesOrderId) {
				When.waitFor({
					id : /SalesOrderID/,
					viewName : sViewName,
					controlType : "sap.m.Text",
					matchers : new Properties({text : sSalesOrderId}),
					success : function (aControls) {
						new Press().executeOn(aControls[0]);
						Opa5.assert.ok(true, "Sales Order selected: " + sSalesOrderId);
					}
				});
			}

			// check 'More' button visibility
			function verifyMoreButton(bVisible) {
				Then.waitFor({
					controlType : "sap.m.CustomListItem",
					id : /SalesOrderList-trigger/,
					visible : false,
					check : function (aControls) {
						return aControls[0].$().is(":visible") === bVisible;
					},
					success : function () {
						Opa5.assert.ok(true,
								bVisible ? "'More' Button visible" : "'More' Button invisible");
					}
				});
			}

			function verifyTypeDetermination() {
				Then.waitFor({
					controlType : "sap.m.Table",
					id : "SalesOrderList",
					check : function (oSalesOrderTable) {
						return oSalesOrderTable.getItems().length > 0;
					},
					success : function () {
						var sTypeName,
						oView = Element.getElementById(sViewName);

						// check for valid automatic type determination for each cell content in 1st
						// row
						oView.byId("SalesOrderList").getItems()[0].getCells()
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
					// sales order IDs are in controls with ID "SalesOrderList:SalesOrderID"
					id : /SalesOrderID-/,
					success : function () {
						var aSalesOrderIds = Element.getElementById(sViewName)
								.byId("SalesOrderList").getItems().map(function (oItem) {
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
					viewName : sViewName,
					controlType : "sap.m.Table",
					check : function (oTable) {
						return oTable[0].getItems().length === aExpectedScheduleIds.length;
					},
					success : function () {
						var aScheduleIds = [];

						Element.getElementById(sViewName).byId("SO_2_SCHDL")
							.getItems().forEach(function (oItem) {
								aScheduleIds.push(oItem.getCells()[0].getText());
							});
						Opa5.assert.deepEqual(aScheduleIds, aExpectedScheduleIds,
							"Verify Schedules");
					}
				});
			}

			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : sUIComponent || "sap.ui.core.sample.odata.v4.SalesOrders"
				}
			});
			Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

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

				selectSalesOrderWithId("0500000005");

				openSchedules();
				verifyVisibleSchedules([
					"005056A71E3D1ED68DDAAE99B0154B70",
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
				markSchedules([
					"005056A71E3D1ED68DDAAE99B0158B70",
					"005056A71E3D1ED68DDAAE99B015CB70"
				]);
				deleteSchedules();
				verifyVisibleSchedules([
					"005056A71E3D1ED68DDAAE99B0154B70",
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
			Then.onAnyPage.checkLog();
		}
	};
});
