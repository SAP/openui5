sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockEmpDetailPart3 = BlockBase.extend("sap.uxap.sample.SharedBlocks.employment.BlockEmpDetailPart3", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.SharedBlocks.employment.BlockEmpDetailPart3",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.SharedBlocks.employment.BlockEmpDetailPart3",
					type: "XML"
				}
			}
		}
	});
	return BlockEmpDetailPart3;
});
