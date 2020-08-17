sap.ui.define([
		'sap/m/library',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(mobileLibrary, Controller, JSONModel) {
	"use strict";

	var URLHelper = mobileLibrary.URLHelper;

	var ListController = Controller.extend("sap.m.sample.UrlHelper.List", {

		onInit : function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/supplier.json"));
			this.getView().setModel(oModel);
		},

		_getVal: function(evt) {
			return evt.getSource().getValue();
		},

		handleTelPress: function (evt) {
			URLHelper.triggerTel(this._getVal(evt));
		},

		handleSmsPress: function (evt) {
			URLHelper.triggerSms(this._getVal(evt));
		},

		handleEmailPress: function (evt) {
			URLHelper.triggerEmail(this._getVal(evt), "Info Request");
		},

		handleUrlPress: function (evt) {
			URLHelper.redirect(this._getVal(evt), true);
		}
	});


	return ListController;

});