// Note: the HTML page 'ValidateURL.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/base/security/URLListValidator",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/library",
	"sap/m/StandardListItem",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/List",
	"sap/m/library",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridData"
], function(URLListValidator, Core, Element, coreLibrary, StandardListItem, Input, Label, List, mobileLibrary, Button, HorizontalLayout, Grid, GridData) {
	"use strict";

	// shortcut for sap.m.ButtonType
	const ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.ListMode
	const ListMode = mobileLibrary.ListMode;

	// shortcut for sap.ui.core.ValueState
	const ValueState = coreLibrary.ValueState;

	Core.ready().then(function () {
		function onChange(oEvent){
			var oInput = Element.getElementById("Input1");
			var sUrl = oInput.getValue();
			var sValid = URLListValidator.validate(sUrl);

			if (sValid) {
				oInput.setValueState(ValueState.Success);
			} else {
				oInput.setValueState(ValueState.Error);
			}
		}

		function onLiveChange(oEvent){
			var oInput = oEvent.oSource;

			if (oEvent.getParameter("liveValue") != oInput.getValue()){
				// only during typing
				oInput.setValueState(ValueState.None);
			}
		}

		function fillListBox(){
			var aAllowlist = URLListValidator.entries();
			var oListBox = Element.getElementById("List");
			oListBox.removeAllItems();

			if (aAllowlist instanceof Array && aAllowlist.length > 0){
				for (var i = 0; i < aAllowlist.length; i++){
					if (aAllowlist[i] instanceof Object){
						oListBox.addItem(new StandardListItem({
							title: aAllowlist[i].protocol + "|" + aAllowlist[i].host + "|" + aAllowlist[i].port + "|" + aAllowlist[i].path
						}));
					}
				}
			}
		}

		function addToAllowlist(oEvent){
			var oProtocol = Element.getElementById("Protocol");
			var oHost = Element.getElementById("Host");
			var oPort = Element.getElementById("Port");
			var oPath = Element.getElementById("Path");
			var oListBox = Element.getElementById("List");
			var sNewUrl = oProtocol.getValue() + "|" + oHost.getValue() + "|" + oPort.getValue() + "|" + oPath.getValue();
			oListBox.addItem(new StandardListItem({
				title: sNewUrl
			}));
			URLListValidator.add(oProtocol.getValue(), oHost.getValue(), oPort.getValue(), oPath.getValue());
			oProtocol.setValue("");
			oHost.setValue("");
			oPort.setValue("");
			oPath.setValue("");
			onChange(oEvent);
		}

		function removeFromAllowlist(oEvent){
			var oListBox = Element.getElementById("List");
			var oItem = oListBox.getSelectedItem();
			if ( oItem == null ) {
				return;
			}
			var iIndex = oListBox.indexOfItem(oItem);
			oListBox.removeItem(oItem);
			oItem.destroy();
			URLListValidator._delete(URLListValidator.entries()[iIndex]);
			onChange(oEvent);
		}

		function clearAllowlist(oEvent){
			var oListBox = Element.getElementById("List");
			URLListValidator.clear();
			oListBox.destroyItems();
			onChange(oEvent);
		}

		var oInput = new Input('Input1',{
			width: "50em",
			change: onChange,
			liveChange: onLiveChange
		});
		var oLabel = new Label({ text: "URL: ", labelFor: oInput});
		oLabel.placeAt("target0");
		oInput.placeAt("target0");

		// allowlist
		var oListBox = new List("List", {
			headerText: "Allowlist:",
			width: "50em",
			mode: ListMode.SingleSelect,
			includeItemInSelection: true
		}).placeAt("target1");
		fillListBox();

		oLabel.setLabelFor(oListBox);
		var oButton = new Button("Button1",{
			text: "Refresh",
			width: "7em",
			press: fillListBox
		});
		var oButton2 = new Button("Button2",{
			text: "Remove",
			width: "7em",
			style: ButtonType.Reject,
			press: removeFromAllowlist
		});
		var oButton3 = new Button("Button3",{
			text: "Clear",
			width: "7em",
			style: ButtonType.Reject,
			press: clearAllowlist
		});

		new HorizontalLayout("Layout1", {
			content: [oButton, oButton2, oButton3]
		}).placeAt("target1");

		new Grid("AllowlistEntry", {
			content: [
				new Label({
					text: "Protocol:",
					labelFor: "Protocol",
					layoutData: new GridData({
						span: "L1 M1 S1"
					})
				}),
				new Label({
					text: "Host:",
					labelFor: "Host",
					layoutData: new GridData({
						span: "L4 M4 S4"
					})
				}),
				new Label({
					text: "Port:",
					labelFor: "Port",
					layoutData: new GridData({
						span: "L1 M1 S1"
					})
				}),
				new Label({
					text: "Path:",
					labelFor: "Path"
				}),

				new Input({id: "Protocol",
					width: "100%",
					layoutData: new GridData({
						linebreak: true,
						span: "L1 M1 S1"
					})
				}),
				new Input({
					id: "Host",
					width: "100%",
					layoutData: new GridData({
						span: "L4 M4 S4"
					})
				}),
				new Input({
					id: "Port",
					width: "4em",
					layoutData: new GridData({
						span: "L1 M1 S1"
					})
				}),
				new Input({
					id: "Path",
					width: "100%",
					layoutData: new GridData({
						span: "L5 M5 S5"
					})
				}),

				new Button("Button4",{
					text: "Add",
					style: ButtonType.Accept,
					press: addToAllowlist,
					layoutData: new GridData({
						span: "L1 M1 S1"
					})
				})
			]
		}).placeAt("target2");
	});
});