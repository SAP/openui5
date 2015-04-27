sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(jQuery, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.QuickViewSpecialCase.QuickView", {

		onInit: function() {
	//		create JSON model instance
			var oModel = new JSONModel();

			// JSON sample data
			var mData = {
				header	: "Employee Info",
				title	: "John Doe",
				titleActive: false,
				icon	: "sap-icon://person-placeholder",
				description: "Department Manager1",
				groups: [
					{
						heading: "Job",
						elements: [
							{
								label: "Company",
								value: "SAP AG",
								url: "http://sap.com",
								elementType: "link"
							},
							{
								label: "Company address",
								value: "Sofia, Boris III, 136A"
							}
						]
					}

				]
			};

			// set the data for the model
			oModel.setData(mData);
			this.getView().setModel(oModel);
		},

		onExit: function() {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		}
	});



	return CController;

});
