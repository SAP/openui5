sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/library',
	'sap/m/MessageToast',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/BindingMode'],
	function (Controller, mobileLibrary, MessageToast, JSONModel, BindingMode) {
	'use strict';

	var BreadcrumbsSeparatorStyle = mobileLibrary.BreadcrumbsSeparatorStyle;

	return Controller.extend('sap.m.sample.Breadcrumbs.controller.Breadcrumbs', {
		onInit: function() {
			var oMData = [],
				oModel =  new JSONModel().setDefaultBindingMode(BindingMode.TwoWay);
			Object.keys(BreadcrumbsSeparatorStyle).forEach(function(item) {
				oMData.push({
					'key' : item,
					'text': BreadcrumbsSeparatorStyle[item]
				});
			});

			oModel.setData({
				items: oMData,
				selected: oMData[0].text
			});
			this.getView().setModel(oModel);
		},
		onPress: function (oEvent) {
			MessageToast.show(oEvent.getSource().getText() + ' has been activated');
		},
		onChange: function (oEvent) {
			var oModel = this.getView().getModel();
			oModel.setProperty('/selected', oEvent.getParameter('selectedItem').getKey());
		}
	});
});
