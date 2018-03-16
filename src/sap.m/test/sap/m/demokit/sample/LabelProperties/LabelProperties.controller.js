sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var LabelPropertiesController = Controller.extend("sap.m.sample.LabelProperties.LabelProperties", {

		onInit : function (evt) {

		},

		onDisplayOnlyChange: function (evt) {
			var label = this.byId('label'),
				labelInForm = this.byId('labelInForm'),
				state = evt.getParameter('state');

			label.setDisplayOnly(state);
			labelInForm.setDisplayOnly(state);
		},

		onWrappingChange: function (evt) {
			var label = this.byId('label'),
				labelInForm = this.byId('labelInForm'),
				state = evt.getParameter('state');

			label.setWrapping(state);
			labelInForm.setWrapping(state);
		},

		onSliderMoved: function (evt) {
			var value = evt.getParameter("value") + "%";
			this.byId("containerForm").setWidth(value);
			this.byId("containerLayout").setWidth(value);
		}
	});

	return LabelPropertiesController;
});
