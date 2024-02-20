sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.BlockBaseEventing.controller.EventingBlock", {
		onInit: function() {
			var oStylesTag = document.createElement("link");
			oStylesTag.setAttribute("rel", "stylesheet");
			oStylesTag.setAttribute("href", "test-resources/sap/uxap/demokit/sample/BlockBaseEventing/styles.css");
			document.head.appendChild(oStylesTag);
		},
		onInnerDummy: function (oEvent) {
			/*
			 Delegate the eventing to the parent block.
			 The outside world will see this event as being triggered by the block itself.
			 */
			this.oParentBlock.fireDummy(oEvent.getParameters());
		}
	});
});
