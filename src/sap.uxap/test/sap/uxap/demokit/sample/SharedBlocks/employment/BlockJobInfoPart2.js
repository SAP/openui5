sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockJobInfoPart2 = BlockBase.extend("sap.uxap.sample.SharedBlocks.employment.BlockJobInfoPart2", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.SharedBlocks.employment.BlockJobInfoPart2",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.SharedBlocks.employment.BlockJobInfoPart2",
					type: "XML"
				}
			}
		}
	});
	return BlockJobInfoPart2;
});
