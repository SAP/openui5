sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT2 = BlockBase.extend("sap.uxap.sample.SharedBlocks.BlockBlueT2", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlueT2",
						type: "XML"
					},
					Expanded: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlueT2",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT2;

	});
