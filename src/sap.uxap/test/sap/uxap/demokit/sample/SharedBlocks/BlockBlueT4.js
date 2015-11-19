sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT4 = BlockBase.extend("sap.uxap.sample.SharedBlocks.BlockBlueT4", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlueT4",
						type: "XML"
					},
					Expanded: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlueT4",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT4;

	});
