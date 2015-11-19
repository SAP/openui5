sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlueT3 = BlockBase.extend("sap.uxap.sample.SharedBlocks.BlockBlueT3", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlueT3",
						type: "XML"
					},
					Expanded: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlueT3",
						type: "XML"
					}
				}
			}
		});

		return BlockBlueT3;

	});
