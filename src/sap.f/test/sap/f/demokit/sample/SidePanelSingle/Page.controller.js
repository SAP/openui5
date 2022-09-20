sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/Switch",
	"sap/m/VBox"
],
function(Controller, MessageToast, Label, Input, Text, Button, Switch, VBox) {

	"use strict";

	var aContent = [
			new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." }),
			new Switch(),
			new Button({ text: "Save" })
	];

	var PageController = Controller.extend("sap.f.sample.SidePanelSingle.Page", {

		onToggle: function(e) {
			var oSidePanel = this.byId("mySidePanel"),
				oPreventExpand = this.byId("preventExpand"),
				oPreventCollapse = this.byId("preventCollapse"),
				bExpanded = e.getParameter("expanded");

			if (!bExpanded) {
				if (oPreventCollapse.getState()) {
					MessageToast.show("I am prevented COLLAPSE event");
					oPreventCollapse.setState(false);
					e.preventDefault();
				}
			} else {
				if (oPreventExpand.getState()) {
					MessageToast.show("I am prevented EXPAND event");
					oPreventExpand.setState(false);
					e.preventDefault();
				} else {
					oSidePanel.addSideContentItem(new VBox({
						items: aContent[0]
					}));
				}
			}
		}

	});

	return PageController;

});
