/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties"
], function (Helper, Opa5, Press, Properties) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.ListBinding.Main";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				openChangeManagerOfTeamDialog : function () {
					return Helper.pressButton(this, sViewName, "openChangeManagerOfTeamDialog");
				},
				openChangeTeamBudgetDialog : function () {
					return Helper.pressButton(this, sViewName, "openChangeTeamBudgetDialog");
				},
				refreshEmployees : function () {
					return Helper.pressButton(this, sViewName, "refreshEmployees");
				},
				selectFirstEmployee : function () {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : /Employee_ID/,
						success : function (aControls) {
							new Press().executeOn(aControls[0]);
							Opa5.assert.ok(true, "First Employee selected");
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkBudgetInForm : function (sBudget) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : "Budget",
						matchers : new Properties({text : sBudget}),
						success : function (oText) {
							Opa5.assert.ok(true, "Budget is: " + sBudget);
						},
						viewName : sViewName
					});
				},
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
								"Equipment name of row " + iRow + " as expected: "
								+ sEquipmentName);
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
								"Name of row " + iRow + " as expected: " + sEmployeeName);
						},
						viewName : sViewName
					});
				},
				checkManagerInForm : function (sManager) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : "ManagerID",
						matchers : new Properties({text : sManager}),
						success : function (oText) {
							Opa5.assert.ok(true, "Manager is: " + sManager);
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
								"URL of equipment image in row " + iRow + " as expected: " + sUrl);
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
		},
		onTheChangeManagerOfTeamDialog : {
			actions : {
				changeManager : function (sManager) {
					return Helper.changeInputValue(this, sViewName,
						"ChangeManagerOfTeamDialog::Manager", sManager);
				},
				pressChange: function () {
					return Helper.pressButton(this, sViewName, "changeManagerOfTeam");
				}
			},
			assertions : {
				checkManager : function (sManager) {
					return Helper.checkInputValue(this, sViewName,
						"ChangeManagerOfTeamDialog::Manager", sManager);
				}
			}
		},
		onTheChangeTeamBudgetDialog : {
			actions : {
				changeBudget : function (sBudget) {
					return Helper.changeInputValue(this, sViewName,
						"ChangeTeamBudgetDialog::Budget", sBudget);
				},
				pressChange: function () {
					return Helper.pressButton(this, sViewName, "changeTeamBudget");
				}
			},
			assertions : {
				checkBudget : function (sBudget) {
					return Helper.checkInputValue(this, sViewName,
						"ChangeTeamBudgetDialog::Budget", sBudget);
				},
				checkTeamID : function (sTeamID) {
					return Helper.checkInputValue(this, sViewName,
						"ChangeTeamBudgetDialog::TeamID", sTeamID);
				}
			}
		}
	});
});