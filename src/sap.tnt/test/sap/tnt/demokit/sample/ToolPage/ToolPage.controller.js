sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/library",
	"sap/tnt/library"
], function (Device, Controller, JSONModel, Popover, Button, Dialog, MessageToast, Text, library, tntLibrary) {
	"use strict";

	var ButtonType = library.ButtonType,
		PlacementType = library.PlacementType,
		NavigationListItemDesign = tntLibrary.NavigationListItemDesign;

	return Controller.extend("sap.tnt.sample.ToolPage.ToolPage", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/tnt/sample/ToolPage/model/data.json"));
			this.getView().setModel(oModel);
			this._setToggleButtonTooltip(!Device.system.desktop);
		},

		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
		},

		onItemPress: function (oEvent) {
			const oItem = oEvent.getParameter("item"),
				sText = oItem.getText();
			MessageToast.show(`Fired itemPress, item: ${sText}`);
		},

		handleUserNamePress: function (event) {
			var oPopover = new Popover({
				showHeader: false,
				placement: PlacementType.Bottom,
				content: [
					new Button({
						text: 'Feedback',
						type: ButtonType.Transparent
					}),
					new Button({
						text: 'Help',
						type: ButtonType.Transparent
					}),
					new Button({
						text: 'Logout',
						type: ButtonType.Transparent
					})
				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');

			oPopover.openBy(event.getSource());
		},

		onSideNavButtonPress: function () {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(bSideExpanded);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		onQuickActionPress: function (oEvent) {
			if (oEvent.oSource.getDesign() !== NavigationListItemDesign.Action) {
				return;
			}
			if (!this.oDefaultDialog) {
				this.oDefaultDialog = new Dialog({
					title: "Create Item",
					type: "Message",
					content: new Text({ text: "Create New Navigation List Item" }),
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
		},

		_setToggleButtonTooltip: function (bLarge) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				oToggleButton.setTooltip('Large Size Navigation');
			} else {
				oToggleButton.setTooltip('Small Size Navigation');
			}
		}

	});
});