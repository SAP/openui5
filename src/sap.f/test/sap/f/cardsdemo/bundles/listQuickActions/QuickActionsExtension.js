sap.ui.define(["sap/ui/integration/Extension", "sap/base/Log"], function (Extension, Log) {
	"use strict";

	var aTasks = [
		{
			"Name": "Development",
			"departmentBudget": "10",
			"departmentBudgetThreshold": "100",
			"icon": "sap-icon://sap-ui5"
		},
		{
			"Name": "Security",
			"departmentBudget": "4000",
			"departmentBudgetThreshold": "100000",
			"icon": "sap-icon://shield"
		},
		{
			"Name": "HR",
			"departmentBudget": "1000000",
			"departmentBudgetThreshold": "100",
			"icon": "sap-icon://hr-approval"
		}
	];

	return Extension.extend("listQuickActions.QuickActionsExtension", {
		init: function () {
			Extension.prototype.init.apply(this, arguments);

			this.attachAction(this._handleAction.bind(this));
		},
		_handleAction: function (oEvent) {
			var oCard = this.getCard(),
				oParameters = oEvent.getParameter("parameters");

			if (oParameters.item) {
				// remove this item
				aTasks.splice(aTasks.indexOf(oParameters.item), 1);
			} else if (oParameters.add) {
				// add a new item
				aTasks.push({
					"Name": "new",
					"departmentBudget": "20",
					"departmentBudgetThreshold": "100",
					"icon": "sap-icon://sap-ui5"
				});
			}

			oCard.refreshData();
		},
		getData: function () {
			return Promise.resolve(aTasks);
		}
	});
});
