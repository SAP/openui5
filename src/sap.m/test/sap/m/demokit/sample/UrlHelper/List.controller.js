sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.UrlHelper.List", {

		onInit : function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/supplier.json");
			this.getView().setModel(oModel);
		},

		_getVal: function(evt) {
			return sap.ui.getCore().byId(evt.getParameter('id')).getValue();
		},

		handleTelPress: function (evt) {
			sap.m.URLHelper.triggerTel(this._getVal(evt));
		},

		handleSmsPress: function (evt) {
			sap.m.URLHelper.triggerSms(this._getVal(evt));
		},

		handleEmailPress: function (evt) {
			sap.m.URLHelper.triggerEmail(this._getVal(evt), "Info Request");
		},

		handleUrlPress: function (evt) {
			sap.m.URLHelper.redirect(this._getVal(evt), true);
		}
	});


	return ListController;

});