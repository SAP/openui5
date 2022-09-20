sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/Switch",
	"sap/m/VBox"
], function(Controller, MessageToast, Label, Input, Text, Button, Switch, VBox) {

	"use strict";

	var aContent = [
		[
			new Label({ text: "Label 1" }),
			new Input(),
			new Label({ text: "Label 2" }),
			new Input(),
			new Label({ text: "Label 3" }),
			new Input()
		],
		[
			new Text({ text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." }),
			new Button({ text: "Press me"}),
			new Button({ text: "Hit me" })
		],
		[
			new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." }),
			new Switch(),
			new Button({ text: "Save" })
		]
	];

	var PageController = Controller.extend("sap.f.sample.SidePanelOverflow.Page", {

		onToggle: function(e) {
			var oSidePanel = this.byId("mySidePanel"),
				oPreventExpand = this.byId("preventExpand"),
				oPreventCollapse = this.byId("preventCollapse"),
				oItem = e.getParameter("actionItem"),
				iItemIndex = oItem ? parseInt(oItem.getId().replace( /^\D+/g, '')) : -1,
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
						items: aContent[iItemIndex % 3]
					}));
				}
			}
		}

	});

	return PageController;

});
