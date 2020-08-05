sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/dnd/DragInfo',
	'sap/ui/core/dnd/DropInfo'
], function (Controller, JSONModel, jQuery, DragInfo, DropInfo) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.GridContainerQuery", {
		onInit: function () {

		},

		onSliderMoved: function (oEvent) {
			var value = oEvent.getParameter("value");
			this.byId("panel1").setWidth(value + "%");
		}
	});
});
