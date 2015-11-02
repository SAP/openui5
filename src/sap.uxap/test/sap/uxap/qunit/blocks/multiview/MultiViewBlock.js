sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("sap.uxap.testblocks.multiview.MultiViewBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.testblocks.multiview.MultiViewBlockCollapsed",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.testblocks.multiview.MultiViewBlockExpanded",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);

