sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/m/IconTabFilter',
		'sap/m/sample/IconTabFilterCustomization/CustomIconTabFilter',
		'sap/m/Text',
		'sap/m/MessageBox',
		'sap/m/MessageToast'
	], function(jQuery, Controller, IconTabFilter, CustomIconTabFilter, Text, MessageBox, MessageToast) {
	'use strict';

	var IconTabBarController = Controller.extend('sap.m.sample.IconTabFilterCustomization.IconTabFilterCustomization', {

		onInit: function () {

				var iconTabFilter,
					iconTabBar = this.getView().byId('idIconTabBar');

			for (var i = 1; i <= 30; i++) {
				iconTabFilter = new CustomIconTabFilter({
					text : 'Tab ' + i,
					modified: i % 2 == 0,
					close: this.onTabClose.bind(this),
					content: new Text({
						text: 'Content ' + i
					})
				});

				iconTabBar.addItem(iconTabFilter);
			}
		},

		onTabClose : function (e) {

			var item = e.getParameter('item'),
				iconTabBar = this.getView().byId('idIconTabBar');

			MessageBox.confirm("Do you want to close the tab '" + item.getText() + "'?", {
				onClose: function (action) {
					if (action === sap.m.MessageBox.Action.OK) {
						iconTabBar.removeItem(item);
						MessageToast.show('Item closed: ' + item.getText(), {duration: 500});
					} else {
						MessageToast.show('Item close canceled: ' + item.getText(), {duration: 500});
					}
				}
			});
		}
	});


	return IconTabBarController;

});
