sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT5 = BlockBase.extend("sap.uxap.sample.SharedBlocks.BlockBlueT5", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlueT5",
						type: "XML"
					},
					Expanded: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlueT5",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT5;

	});
