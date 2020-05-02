sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockJobInfoPart3 = BlockBase.extend("sap.uxap.sample.SharedBlocks.employment.BlockJobInfoPart3", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.SharedBlocks.employment.BlockJobInfoPart3",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.SharedBlocks.employment.BlockJobInfoPart3",
					type: "XML"
				}
			}
		}
	});

	return BlockJobInfoPart3;

});
