sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("sap.uxap.testblocks.objectpageblock.InfoButton", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.testblocks.objectpageblock.InfoButton",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.testblocks.objectpageblock.InfoButtonExpanded",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);

