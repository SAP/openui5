sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/ui/model/json/JSONModel"
], 	function(Controller, MessageToast, Label, Input, Text, VBox, JSONModel) {

	"use strict";

	var PageController = Controller.extend("sap.f.sample.SidePanel.Page", {
		onInit: function () {
			var sPosition = this.byId('mySidePanel').getSidePanelPosition();
			var oModel = new JSONModel();
			oModel.setData({ sidePanelPosition: sPosition });
			this.getView().setModel(oModel, "settings");
		},
		onToggle: function(e) {
			var oPreventExpand = this.byId("preventExpand"),
				oPreventCollapse = this.byId("preventCollapse"),
				oItem = e.getParameter("item"),
				iItemIndex = oItem ? parseInt(oItem.getId().replace( /^\D+/g, '')) : -1,
				bExpanded = e.getParameter("expanded");

			if (!bExpanded) {
				if (oPreventCollapse.getState()) {
					MessageToast.show("I am prevented COLLAPSE event");
					oPreventCollapse.setState(false);
					e.preventDefault();
				}
			} else if (oPreventExpand.getState()) {
				MessageToast.show("I am prevented EXPAND event");
				oPreventExpand.setState(false);
				e.preventDefault();
			} else if (iItemIndex === 2) {
				// destroy existing item content
				oItem.destroyContent();
				// then add new dynamically created content
				oItem.addContent(new VBox({
					items: [
						new Text({ text: "Dynamically added content" }).addStyleClass("sapUiSmallMarginBottom"),
						new Label({ text: "Label 1" }),
						new Input(),
						new Label({ text: "Label 2" }),
						new Input(),
						new Label({ text: "Label 3" }),
						new Input()
					]
				}));
			}
		},
		onChangePosition: function (e) {
			this.byId('mySidePanel').setSidePanelPosition(e.getParameter("selectedItem").getKey());
		}

	});

	return PageController;

});
