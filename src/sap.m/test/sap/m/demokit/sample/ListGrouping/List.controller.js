sap.ui.define([
		'jquery.sap.global',
		'sap/m/GroupHeaderListItem',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, GroupHeaderListItem, Controller, JSONModel) {
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
		}
	});


	return ListController;

});
