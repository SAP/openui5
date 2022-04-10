/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press"
], function (Helper, Opa5, Press) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.ListBinding.Main";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				openChangeManagerOfTeamDialog : function () {
					Helper.pressButton(this, sViewName, "openChangeManagerOfTeamDialog");
				},
				openChangeTeamBudgetDialog : function () {
					Helper.pressButton(this, sViewName, "openChangeTeamBudgetDialog");
				},
				refreshEmployees : function () {
					Helper.pressButton(this, sViewName, "refreshEmployees");
				},
				selectFirstEmployee : function () {
					this.waitFor({
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
					Helper.checkTextValue(this, sViewName, "Budget", sBudget);
				},
				checkEmployeeEquipmentInRow : function (iRow, sEquipmentName) {
					Helper.checkInputValue(this, sViewName, /EQUIPMENT_2_PRODUCT:Name/,
						sEquipmentName, iRow);
				},
				checkEmployeeNameInRow : function (iRow, sEmployeeName) {
					Helper.checkInputValue(this, sViewName, /Employee_Name/, sEmployeeName, iRow);
				},
				checkManagerInForm : function (sManager) {
					Helper.checkTextValue(this, sViewName, "ManagerID", sManager);
				},
				checkProductImageInRow : function (iRow, sUrl) {
					this.waitFor({
						controlType : "sap.m.Table",
						id : "EmployeeEquipments",
						success : function (oEmployeeEquipments) {
							var oRow = oEmployeeEquipments.getItems()[iRow],
								oImage = oRow.getCells()[1];

							Opa5.assert.strictEqual(
								oImage.getSrc(),
								sUrl[0] === "/"
								? sUrl
								: oImage.getBinding("src").getModel().sServiceUrl + sUrl,
								"URL of equipment image in row " + iRow + " as expected: " + sUrl);
						},
						viewName : sViewName
					});
				},
				checkTeamIDInForm : function (sTeamID) {
					Helper.checkTextValue(this, sViewName, "Team_Id", sTeamID);
				}
			}
		},
		onTheChangeManagerOfTeamDialog : {
			actions : {
				changeManager : function (sManager) {
					Helper.changeInputValue(this, sViewName, "ChangeManagerOfTeamDialog::Manager",
						sManager);
				},
				pressChange : function () {
					Helper.pressButton(this, sViewName, "changeManagerOfTeam");
				}
			},
			assertions : {
				checkManager : function (sManager) {
					Helper.checkInputValue(this, sViewName, "ChangeManagerOfTeamDialog::Manager",
						sManager);
				}
			}
		},
		onTheChangeTeamBudgetDialog : {
			actions : {
				changeBudget : function (sBudget) {
					Helper.changeInputValue(this, sViewName, "ChangeTeamBudgetDialog::Budget",
						sBudget);
				},
				pressChange : function () {
					Helper.pressButton(this, sViewName, "changeTeamBudget");
				}
			},
			assertions : {
				checkBudget : function (sBudget) {
					Helper.checkInputValue(this, sViewName, "ChangeTeamBudgetDialog::Budget",
						sBudget);
				},
				checkTeamID : function (sTeamID) {
					Helper.checkInputValue(this, sViewName, "ChangeTeamBudgetDialog::TeamID",
						sTeamID);
				}
			}
		}
	});
});
