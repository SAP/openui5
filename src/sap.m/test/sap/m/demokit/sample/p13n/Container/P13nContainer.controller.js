sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/p13n/AbstractContainerItem'
], function(Controller, JSONModel, AbstractContainerItem) {
	"use strict";

	return Controller.extend("sap.m.sample.p13n.Container.Page", {

		onInit: function() {
			this.getView().setModel(new JSONModel({
				dialogMode: true,
				listLayout: true
			}));
		},

		onContainerOpen: function() {
			const oView = this.getView();
			const bDialog = oView.byId("dialogChose").getSelectedButton().getText() == "Dialog";
			const oPopup = bDialog ? oView.byId("d1") : oView.byId("p1");

			if (bDialog) {
				oPopup.open();
			} else {
				oPopup.openBy(oView.byId("openBtn"));
			}
		},

		closeDialog: function(oEvt) {
			oEvt.getSource().getParent().close();
		},

		addCustomView: function(oEvt) {
			let oCurrent = oEvt.getSource();
			while (!oCurrent.isA("sap.m.Dialog") && !oCurrent.isA("sap.m.ResponsivePopover")) {
				oCurrent = oCurrent.getParent();
			}

			const oP13nContainer = oCurrent.getContent()[0];

			const iLength = oP13nContainer.getViews().length;
			oP13nContainer.addView(new AbstractContainerItem({
				text: "View " + iLength,
				key: "view" + iLength
			}));
		},

		selectLayout: function(oEvt) {
			const iBtn = oEvt.getParameter("selectedIndex");
			oEvt.getSource().getModel().setProperty("/listLayout", iBtn === 0);
		}
	});
});