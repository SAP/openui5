sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var GoalsBlock = BlockBase.extend("sap.uxap.sample.SharedBlocks.goals.GoalsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.SharedBlocks.goals.GoalsBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.SharedBlocks.goals.GoalsBlock",
					type: "XML"
				}
			}
		}
	});
	return GoalsBlock;
}, true);
