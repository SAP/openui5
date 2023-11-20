sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.ResponsivePopover.C", {

		handleOpen: function () {
			var oResponsivePopoverOpener = this.getView().byId("openResponsivePopoverButton");
			var oResponsivePopover = this.getView().byId("helloResponsivePopover");
			oResponsivePopover.showAt(oResponsivePopoverOpener);

		},

		handleClose: function () {
			var oResponsivePopover = this.getView().byId("helloResponsivePopover");
			oResponsivePopover.close();
		}

	});
});