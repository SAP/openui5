sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	return BlockBase.extend("sap.uxap.sample.BlockBaseEventing.EventingBlock", {
		metadata: {
			events: {
				"dummy": {}
			}
		}
	});
}, true);
