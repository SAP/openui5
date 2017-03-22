sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var ConnectionsBlock = BlockBase.extend("sap.uxap.sample.SharedBlocks.connections.ConnectionsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.SharedBlocks.connections.ConnectionsBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.SharedBlocks.connections.ConnectionsBlock",
					type: "XML"
				}
			}
		}
	});
	return ConnectionsBlock;
}, true);
