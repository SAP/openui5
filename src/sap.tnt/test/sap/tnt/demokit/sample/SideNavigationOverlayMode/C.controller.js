sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/library",
	'sap/ui/core/Fragment',
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (Controller, Dialog, Button, Text, library, Fragment, JSONModel, Device) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	return Controller.extend("sap.tnt.sample.SideNavigationOverlayMode.C", {
		onToggleSideNav: async function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._oPopover) {
				this._oPopover = await Fragment.load({
					id: oView.getId(),
					name: "sap.tnt.sample.SideNavigationOverlayMode.Popover",
					controller: this
				});
				oView.addDependent(this._oPopover);
				this._oPopover.setShowHeader(Device.system.phone);
			}

			if (this._oPopover.isOpen()) {
				this._oPopover.close();
			} else {
				this._oPopover.openBy(oButton);
			}
		},

		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			var sKey = oItem.getKey();
			var oNavCon = this.byId("pageContainer");

			if (sKey && oItem.getSelectable()) {
				const oVBox = this.byId(sKey).getContent()[0];
				const oText = oVBox.getItems()[0];
				oText.setText("Fired event to load page " + sKey.replace("page", ""));
				oNavCon.to(this.byId(sKey));
			}

			if (this._oPopover.isOpen()) {
				this._oPopover.close();
			}
		},

		onQuickActionPress: function () {
			if (!this.oDefaultDialog) {
				this.oDefaultDialog = new Dialog({
					title: "Create Item",
					type: "Message",
					content: new Text({
						text: "Create New Navigation List Item"
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Create",
						press: function () {
							this.oDefaultDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oDefaultDialog.close();
						}.bind(this)
					})
				});

				this.getView().addDependent(this.oDefaultDialog);
			}

			this.oDefaultDialog.open();
			if (this._oPopover.isOpen()) {
				this._oPopover.close();
			}
		}
	});
});