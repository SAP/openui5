sap.ui.define(['jquery.sap.global','sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.StandardListItemInfoStateInverted.List", {

		onInit : function (evt) {

			var oData = {
				names: [{
						title: "Title text",
						desc: "Description text",
						icon: "sap-icon://favorite",
						highlight: "Success",
						info: "Completed"
					},
					{
						title: "Title text",
						desc: "Description text",
						icon: "sap-icon://employee",
						highlight: "Error",
						info: "Incomplete"
					},
					{
						title: "Title text",
						icon: "sap-icon://accept",
						highlight: "Information",
						info: "Information"
					},
					{
						title: "Title text",
						icon: "sap-icon://activities",
						highlight: "None",
						info: "None"
					},
					{
						title: "Title text",
						desc: "Description text",
						icon: "sap-icon://badge",
						highlight: "Warning",
						info: "Warning"
					}
				]
			};
			// set explored app's demo model on this sample
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel);
		}
	});


	return ListController;

});