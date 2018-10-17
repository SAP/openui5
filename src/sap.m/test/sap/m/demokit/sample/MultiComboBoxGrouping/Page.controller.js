sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/m/GroupHeaderListItem',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, GroupHeaderListItem, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.MultiComboBoxGrouping.Page", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		getGroupHeader: function (oGroup) {
			return new GroupHeaderListItem( {
				title: oGroup.key,
				upperCase: false
			});
		}
	});


	return PageController;

});