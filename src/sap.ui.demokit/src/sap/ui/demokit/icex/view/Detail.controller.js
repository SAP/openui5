/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/IconPool",
	"sap/ui/model/json/JSONModel",
	"sap/m/InstanceManager",
	"sap/m/MessageToast",
	"sap/ui/Device"], function (Controller, IconPool, JSONModel, InstanceManager, MessageToast, Device) {
	"use strict";

	return Controller.extend("sap.ui.demokit.icex.view.Detail", {

		onInit : function() {

			// register for events
			var bus = this.getOwnerComponent().getEventBus();
			bus.subscribe("app", "RefreshDetail", this.refreshDetail, this);

			// set empty model
			this._setModel("sap-icon://question-mark");
		},

		_setModel : function(iconName) {

			var favModel = this.getView().getModel("fav");
			var favorite = (favModel) ? favModel.isFavorite(iconName) : false;
			var model = this.getView().getModel();
			if (!model) {
				model = new JSONModel({});
				this.getView().setModel(model);
			}
			var info = IconPool.getIconInfo(iconName);
			var id = (!info) ? "?" : info.content.charCodeAt(0).toString(16);
			model.setData({
				name : iconName,
				id : id,
				showFavorite : !favorite,
				showUnfavorite : favorite,
				isPhone : Device.system.phone,
				isNoPhone : !Device.system.phone
			});
		},

		refreshDetail : function(channelId, eventId, data) {
			if (data && data.name) {
				this._setModel(data.name);
			}
		},

		navBack : function(evt) {
			var bus = this.getOwnerComponent().getEventBus();
			bus.publish("nav", "back");
		},

		favorite : function(evt) {
			var data = this.getView().getModel().getData();
			if (data && data.name) {

				// update favorite model
				var favModel = this.getView().getModel("fav");
				var nowAFavorite = favModel.toggleFavorite(data.name);

				// show  message
				if (InstanceManager.hasOpenPopover()) {
					InstanceManager.closeAllPopovers();
				}
				if (nowAFavorite) {
					MessageToast.show('The icon has been added to your favorites');
				} else {
					MessageToast.show('The icon has been removed from your favorites');
				}

				// update my model
				this._setModel(data.name);
			}
		}
	});
});
