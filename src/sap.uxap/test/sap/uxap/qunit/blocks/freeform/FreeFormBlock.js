sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("sap.uxap.testblocks.freeform.FreeFormBlock", {
		setMode: function (sMode) {
			var oNewView;

			oNewView = sap.ui.view({
				viewName: "sap.uxap.testblocks.freeform.FreeFormBlock",
				type: "XML"
			});

			//link to the controller defined in the Block
			if (oNewView) {
				this.addAggregation("_views", oNewView);
				this.setAssociation("selectedView", oNewView);
			} else {
				jQuery.sap.log.error("BlockBase :: no view provided for mode " + sMode);
			}

			this.setProperty("mode", sMode);
		}
	});
	return myBlock;
}, true);

