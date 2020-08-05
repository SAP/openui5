sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.DataService", {

		onPress: function () {
			this.getOwnerComponent().getService("UserRecent").then(function (oService) {
				oService.addData({
					"title": "Online Payslip",
					"description": "Your salary overview 09/18",
					"info": "4 weeks ago",
					"icon": "sap-icon://customer-financial-fact-sheet",
					"category": "Private"
				});
			});
		},

		onRefresh: function () {
			this.getView().byId("SalesOrdersCard").refresh();
		}

	});
});