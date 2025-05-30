sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Element",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Input",
	"sap/tnt/NavigationListItem",
	"sap/m/MessageToast",
	"sap/m/library"
], function (Controller, Element, Dialog, Button, Label, Input, NavigationListItem, MessageToast, library) {
	"use strict";

	// shortcut for sap.m.ButtonType
	const ButtonType = library.ButtonType;

	return Controller.extend("sap.tnt.sample.SideNavigationPressEvent.C", {

		onCollapseExpandPress() {
			const oSideNavigation = this.byId("sideNavigation"),
				bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		},

		quickActionPress() {
			if (!this.oDefaultDialog) {
				this.oDefaultDialog = new Dialog({
					title: "Create Navigation List Item",
					type: "Message",
					content: [
						new Label({
							text: "Name:",
							labelFor: "navigationItemName"
						}),
						new Input("navigationItemName", {
							width: "100%",
							placeholder: "Name"
						}),
						new Label({
							text: "Icon:",
							labelFor: "navigationItemIcon"
						}),
						new Input("navigationItemIcon", {
							width: "100%",
							placeholder: "sap-icon://home"
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Create",
						press: function () {
							const sName = Element.getElementById("navigationItemName").getValue(),
								sIcon = Element.getElementById("navigationItemIcon").getValue();
							this.byId("sideNavigation").getItem().addItem(new NavigationListItem({
								text: sName || "New Navigation Item",
								expanded: true,
								icon: sIcon || "sap-icon://building"
							}));
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
		},

		itemPress(oEvent) {
			const bPreventDefault = this.byId("preventDefaultCheckbox").getSelected();
			const oItem = oEvent.getParameter("item"),
				sText = oItem.getText(),
				bCtrlKey = oEvent.getParameter("ctrlKey"),
				bShiftKey = oEvent.getParameter("shiftKey"),
				bAltKey = oEvent.getParameter("altKey"),
				bMetaKey = oEvent.getParameter("metaKey");

			if (bPreventDefault) {
				oEvent.preventDefault();
				MessageToast.show(`Default was prevented:
					Item: ${sText}
					Ctrl Key: ${bCtrlKey}
					Shift Key: ${bShiftKey}
					Alt Key: ${bAltKey}
					Meta Key: ${bMetaKey}`);
			} else {
				MessageToast.show(`Item Pressed:
					Item: ${sText}
					Ctrl Key: ${bCtrlKey}
					Shift Key: ${bShiftKey}
					Alt Key: ${bAltKey}
					Meta Key: ${bMetaKey}`);
			}
		}
	});
});