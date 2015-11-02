sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueWithInfo = BlockBase.extend("sap.uxap.sample.SharedBlocks.BlockBlueWithInfo", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlueWithInfo",
						type: "XML"
					},
					Expanded: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlueWithInfo",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueWithInfo;

	});
