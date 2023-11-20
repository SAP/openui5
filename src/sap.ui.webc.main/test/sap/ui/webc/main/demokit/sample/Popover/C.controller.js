sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.Popover.C", {

		handleOpen: function () {
			var oPopoverOpener = this.getView().byId("openPopoverButton");
			var oPopover = this.getView().byId("helloPopover");
			oPopover.showAt(oPopoverOpener);
		},

		handleClose: function () {
			var oPopover = this.getView().byId("helloPopover");
			oPopover.close();
		}

	});
});