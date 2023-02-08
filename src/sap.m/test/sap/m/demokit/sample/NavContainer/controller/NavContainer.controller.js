sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.NavContainer.controller.NavContainer", {

		onNavigationFinished: function(evt) {
			var toPage = evt.getParameter("to");
			MessageToast.show("Navigation to page '" + toPage.getTitle() + "' finished");
		},

		handleNav: function(evt) {
			var navCon = this.byId("navCon");
			var target = evt.getSource().data("target");
			if (target) {
				var animation = this.byId("animationSelect").getSelectedKey();
				navCon.to(this.byId(target), animation);
			} else {
				navCon.back();
			}
		}
	});
});
