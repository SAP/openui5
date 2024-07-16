// Note: the HTML page 'CheckBoxRequired.html' loads this module via data-sap-ui-on-init

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/mvc/XMLView", "sap/ui/model/json/JSONModel", "sap/m/MessageToast", "sap/ui/thirdparty/jquery"],
	function(Controller, XMLView, JSONModel, MessageToast, jQuery) {
		"use strict";
		Controller.extend("SampleController", {
			onInit: function () {
				var model = new JSONModel();
				model.setData({
					selected_cb_1: false,
					selected_cb_2: false
				});
				this.getView().setModel(model);
			},

			onSubmit: function (sCheckBoxId) {
				var bSelected = this.getView().getModel().getProperty("/selected_" + sCheckBoxId);
				if (!bSelected) {
					MessageToast.show("Please accept the terms and conditions.");
				} else {
					MessageToast.show("Form submitted!");
				}
			}
		});

		XMLView.create({definition: jQuery('#SampleView').html()}).then(function (oView) {
			oView.placeAt("content");
		});
	});