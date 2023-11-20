sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, Fragment) {
	"use strict";

	return Controller.extend("sap.m.sample.AvatarActiveState.controller.AvatarActiveState", {
		onInit: function () {
			var oJsonModel = new JSONModel({
				Woman01: sap.ui.require.toUrl("sap/m/images/Woman_avatar_01.png")
			});
			this.oView = this.getView();
			this.oView.setModel(oJsonModel);
			this.oMyAvatar = this.oView.byId("myAvatar");
			this._oPopover = Fragment.load({
				id: this.oView.getId(),
				name: "sap.m.sample.AvatarActiveState.view.Popover",
				controller: this
			}).then(function(oPopover) {
				this.oView.addDependent(oPopover);
				this._oPopover = oPopover;
			}.bind(this));
		},
		onPress: function(oEvent) {
			var oEventSource = oEvent.getSource(),
				bActive = this.oMyAvatar.getActive();

			this.oMyAvatar.setActive(!bActive);

			if (bActive) {
				this._oPopover.close();
			} else {
				this._oPopover.openBy(oEventSource);
			}
		},
		onPopoverClose: function () {
			this.oMyAvatar.setActive(false);
		},
		onListItemPress: function () {
			this.oMyAvatar.setActive(false);
			this._oPopover.close();
		}
	});
});