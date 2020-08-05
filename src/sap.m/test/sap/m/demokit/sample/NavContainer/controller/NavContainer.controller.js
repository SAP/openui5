sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.NavContainer.controller.NavContainer", {

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
