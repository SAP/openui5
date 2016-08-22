/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/IconPool",
	"sap/ui/model/json/JSONModel",
	"sap/m/InstanceManager",
	"sap/m/MessageToast",
	"sap/ui/Device"],
function (Controller, IconPool, JSONModel, InstanceManager, MessageToast, Device) {
	"use strict";

	return Controller.extend("sap.ui.demokit.icex.view.Detail", {

		onInit : function() {

			// set empty model
			this.getView().setModel(new JSONModel({}));

			// register for events
			var bus = this.getOwnerComponent().getEventBus();
			bus.subscribe("app", "RefreshDetail", function(channelId, eventId, data) {
				if (data && data.name) {
					this._update(data.name);
				}
			}, this);
		},

		_update : function(iconName) {

			// update model
			var favModel = this.getView().getModel("fav"),
				favorite = (favModel) ? favModel.isFavorite(iconName) : false,
				model = this.getView().getModel(),
				info = IconPool.getIconInfo(iconName),
				sId = (!info) ? "?" : info.content.charCodeAt(0).toString(16);
			model.setData({
				name : iconName,
				id : sId,
				showFavorite : !favorite,
				showUnfavorite : favorite,
				isPhone : Device.system.phone,
				isNoPhone : !Device.system.phone
			});

			// update ID Label
			var oLabel = this.getView().byId("idLabel"),
				oBundle = this.getView().getModel("i18n").getResourceBundle(),
				sText = oBundle.getText("iconIDLabel", [ sId ]);
			oLabel.setText(sText);
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
				this._update(data.name);
			}
		}
	});
});
