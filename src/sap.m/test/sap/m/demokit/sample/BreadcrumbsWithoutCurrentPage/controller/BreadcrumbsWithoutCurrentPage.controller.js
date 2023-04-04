sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast',
	'sap/ui/model/json/JSONModel',
	'sap/m/library'
], function (Controller, MessageToast, JSONModel, library) {
	'use strict';

	var BreadcrumbsSeparatorStyle = library.BreadcrumbsSeparatorStyle;

	return Controller.extend('sap.m.sample.BreadcrumbsWithoutCurrentPage.controller.BreadcrumbsWithoutCurrentPage', {
		onInit: function () {
			var oMData = [],
				oModel = new JSONModel();

			Object.keys(BreadcrumbsSeparatorStyle).forEach(function (item) {
				oMData.push({
					'key': item,
					'text': BreadcrumbsSeparatorStyle[item]
				});
			});

			oModel.setData({ items: oMData });
			this.getView().setModel(oModel);
		},

		onPress: function (oEvent) {
			MessageToast.show(oEvent.getSource().getText() + ' has been clicked');
		},

		onChange: function (oEvent) {
			var oModel = this.getView().getModel();
			oModel.setProperty('/separatorStyle', oEvent.getParameter('selectedItem').getKey());
		}
	});
});
