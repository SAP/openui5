sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
],
function(Controller, MessageToast) {

	"use strict";

	var PageController = Controller.extend("sap.f.sample.SidePanelSingle.Page", {

		onToggle: function(e) {
			var oPreventExpand = this.byId("preventExpand"),
				oPreventCollapse = this.byId("preventCollapse"),
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
			}
		}

	});

	return PageController;

});
