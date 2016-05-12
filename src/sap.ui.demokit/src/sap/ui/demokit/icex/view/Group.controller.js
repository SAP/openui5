/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demokit/icex/model/Config"
	], function (jQuery, Device, Controller, JSONModel, Config) {
	"use strict";

	return Controller.extend("sap.ui.demokit.icex.view.Group", {

		onInit : function() {

			// set ui model
			var oModel = new JSONModel({
				listMode : (Device.system.phone) ? "None" : "SingleSelectMaster",
				listItemType : (Device.system.phone) ? "Active" : "Inactive",
				listPageSize : Config.getPageSize()
			});
			this.getView().setModel(oModel, "ui");

			// remove footer on phone
			if (Device.system.phone) {
				this.getView().byId("page").destroyFooter();
			}

			// subscribe to onBeforeShow events
			this.getView().addEventDelegate({
				onBeforeShow : jQuery.proxy(function(evt) {
					this.onBeforeShow(evt);
				}, this)
			});
		},

		onBeforeShow : function(evt) {
			if (evt.data && evt.data.context) {
				this.getView().setBindingContext(evt.data.context);
			}
		},

		toFavorite : function(evt) {
			var bus = this.getOwnerComponent().getEventBus();
			bus.publish("nav", "to", {
				id : "Favorite"
			});
		},

		navBack : function(evt) {
			var bus = this.getOwnerComponent().getEventBus();
			bus.publish("nav", "back");
		},

		selectIconList : function(evt) {
			this._showDetail(evt.getParameter("listItem"));
		},

		pressIconListItem : function(evt) {
			this._showDetail(evt.getSource());
		},

		_showDetail : function(item) {

			// tell app controller to navigate
			var bus = this.getOwnerComponent().getEventBus();
			bus.publish("nav", "to", {
				id : "Detail"
			});

			// tell detail to update
			bus.publish("app", "RefreshDetail", {
				name : item.getBindingContext().getObject().name
			});
		}
	});
});
