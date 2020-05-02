sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";

	return BlockBase.extend("sap.uxap.sample.BlockBaseEventing.view.EventingBlock", {
		metadata: {
			events: {
				"dummy": {}
			}
		}
	});
});
