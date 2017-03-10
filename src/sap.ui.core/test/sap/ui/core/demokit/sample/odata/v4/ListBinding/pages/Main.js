/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Properties"
],
function (Opa5, Properties) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.ListBinding.Main";

	Opa5.extendConfig({autoWait : true});

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				selectFirstEmployee : function () {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : /--Employee_ID/,
						success : function (aControls) {
							aControls[0].$().tap();
							Opa5.assert.ok(true, "First Employee selected");
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkEmployeeEquipmentInRow : function (iRow, sEquipmentName) {
					var that = this;
					return that.waitFor({
						controlType : "sap.m.Table",
						id : "EmployeeEquipments",
						success : function (oEmployeeEquipments) {
							var oRow = oEmployeeEquipments.getItems()[iRow];
							Opa5.assert.strictEqual(
									oRow.getCells()[1].getValue(),
									sEquipmentName,
									"Equipment name of row " + iRow + " as expected \""
									+ sEquipmentName + "\"");
						},
						viewName : sViewName
					});
				},
				checkEmployeeNameInRow : function (iRow, sEmployeeName) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "Employees",
						success : function (oEmployees) {
							var oRow = oEmployees.getItems()[iRow];
							Opa5.assert.strictEqual(
								oRow.getCells()[0].getValue(),
								sEmployeeName,
								"Name of row " + iRow + " as expected \""
									+ sEmployeeName + "\"");
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
											"Unexpected warning or error found: " + sComponent
											+ " Level: " + oLog.level
											+ " Message: " + oLog.message );
									}
								});
							Opa5.assert.ok(true, "Log checked");
						}
					});
				},
				checkTeamIDInForm : function (sTeamID) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : "Team_Id",
						matchers : new Properties({text : sTeamID}),
						success : function (oText) {
							Opa5.assert.ok(true, "Team ID " + sTeamID + " found");
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});