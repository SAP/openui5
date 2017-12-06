sap.ui.define([
		'jquery.sap.global',
		'sap/m/GroupHeaderListItem',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/Menu',
		'sap/m/MenuItem'
	], function(jQuery, GroupHeaderListItem, Controller, JSONModel, Menu, MenuItem) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.ListGrouping.List", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		},

		getGroupHeader: function (oGroup){
			return new GroupHeaderListItem( {
				title: oGroup.key,
				upperCase: false
			} );
		},

		onToggleContextMenu: function(oEvent) {
			if (oEvent.getParameter("pressed")) {
				this.byId("idList").setContextMenu(new Menu({
					items: [
						new MenuItem({text: "{Name}"}),
						new MenuItem({text: "{ProductId}"})
					]
				}));
			} else {
				this.byId("idList").destroyContextMenu();
			}
		}
	});


	return ListController;

});
