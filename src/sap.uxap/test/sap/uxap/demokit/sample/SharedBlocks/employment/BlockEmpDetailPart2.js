sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockEmpDetailPart2 = BlockBase.extend("sap.uxap.sample.SharedBlocks.employment.BlockEmpDetailPart2", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.SharedBlocks.employment.BlockEmpDetailPart2",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.SharedBlocks.employment.BlockEmpDetailPart2",
					type: "XML"
				}
			}
		}
	});

	return BlockEmpDetailPart2;
});
