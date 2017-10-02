sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Controller, JSONModel) {
	"use strict";

	var VController = Controller.extend("sap.m.sample.TitleWrapping.V", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			this.getView();
		},

		enableWrapping : function(evt) {
			var title = sap.ui.getCore().byId("__xmlview0--WrappingTitle");

			if (title.getWrapping()) {
				title.setWrapping(false);
			} else {
				title.setWrapping(true);
			}
		},
		changeWidth : function(evt) {
			var flexBox = sap.ui.getCore().byId("__xmlview0--FlexBox"),	slider = sap.ui.getCore().byId("__xmlview0--Slider");

			flexBox.setWidth(slider.getValue() + "%");
		}

	});


	return VController;

});
