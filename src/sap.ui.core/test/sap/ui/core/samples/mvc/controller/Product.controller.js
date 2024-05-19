sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.mvctest.controller.Product", {

		onInit: function() {
			this.myLayout = this.byId("Layout");

			this.showDetailsLink = this.byId("showMore");
			this.hideDetailsLink = this.byId("hideMore");

			this.hideMore();
		},


		showMore: function(oEvent) {
			for (var i = 1; i < 4; i++) {
				this.byId("More" + i).setVisible(true);
				this.byId("TFMore" + i).setVisible(true);
			}
			this.showDetailsLink.setVisible(false);
			this.hideDetailsLink.setVisible(true);
		},

		hideMore: function(oEvent) {
			for (var i = 1; i < 4; i++) {
				this.byId("More" + i).setVisible(false);
				this.byId("TFMore" + i).setVisible(false);
			}
			this.showDetailsLink.setVisible(true);
			this.hideDetailsLink.setVisible(false);
		}
	});

});
