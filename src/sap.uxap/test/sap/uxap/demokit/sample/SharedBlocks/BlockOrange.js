sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockOrange = BlockBase.extend("sap.uxap.sample.SharedBlocks.BlockOrange", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockOrange",
						type: "XML"
					},
					Expanded: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockOrange",
						type: "XML"
					}
				}
			}
		});

		return BlockOrange;

	});
