sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/library"
], function (Controller, Dialog, Button, Text, library) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	return Controller.extend("sap.tnt.sample.SideNavigation.C", {

		onCollapseExpandPress() {
			const oSideNavigation = this.byId("sideNavigation"),
				bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		},

		onHideShowWalkedPress() {
			const oNavListItem = this.byId("walked");
			oNavListItem.setVisible(!oNavListItem.getVisible());
		},
		quickActionPress() {
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

				// to get access to the controller's model
				this.getView().addDependent(this.oDefaultDialog);
			}

			this.oDefaultDialog.open();
		}

	});
});