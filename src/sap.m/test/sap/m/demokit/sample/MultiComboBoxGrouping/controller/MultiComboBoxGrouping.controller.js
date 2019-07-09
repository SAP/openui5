sap.ui.define([
		'sap/m/GroupHeaderListItem',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(GroupHeaderListItem, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.MultiComboBoxGrouping.controller.MultiComboBoxGrouping", {

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
});