sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.BlockBaseEventing.controller.EventingBlock", {
		onInnerDummy: function (oEvent) {
			/*
			 Delegate the eventing to the parent block.
			 The outside world will see this event as being triggered by the block itself.
			 */
			this.oParentBlock.fireDummy(oEvent.getParameters());
		}
	});
});
