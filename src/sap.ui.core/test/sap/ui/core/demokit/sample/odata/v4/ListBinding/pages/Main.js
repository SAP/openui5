/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties"
],
function (Helper, Opa5, Press, Properties) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.ListBinding.Main";

	Opa5.extendConfig({autoWait : true});

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				refreshEmployees : function () {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						id : "refreshEmployees",
						viewName : sViewName
					});
				},
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
									oRow.getCells()[2].getValue(),
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
								oRow && oRow.getCells()[0].getValue(),
								sEmployeeName,
								"Name of row " + iRow + " as expected \""
									+ sEmployeeName + "\"");
						},
						viewName : sViewName
					});
				},
				checkProductImageInRow : function (iRow, sUrl) {
					var that = this;
					return that.waitFor({
						controlType : "sap.m.Table",
						id : "EmployeeEquipments",
						success : function (oEmployeeEquipments) {
							var oRow = oEmployeeEquipments.getItems()[iRow],
								oImage = oRow.getCells()[1];
							Opa5.assert.strictEqual(
								oImage.getSrc(),
								oImage.getBinding("src").getModel().sServiceUrl + sUrl,
								"URL of equipment image in row " + iRow + " as expected \""
								+ sUrl + "\"");
						},
						viewName : sViewName
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