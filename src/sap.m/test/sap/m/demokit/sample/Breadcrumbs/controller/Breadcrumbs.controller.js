sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast',
	'sap/ui/model/json/JSONModel'],
	function (Controller, MessageToast, JSONModel) {
	'use strict';

	return Controller.extend('sap.m.sample.Breadcrumbs.controller.Breadcrumbs', {
		onInit: function() {
			var oMData = [],
				oModel =  new JSONModel().setDefaultBindingMode("TwoWay"),
				BreadcrumbsSeparatorStyle = sap.m.BreadcrumbsSeparatorStyle;
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
