sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockGreen = BlockBase.extend("sap.uxap.sample.SharedBlocks.BlockGreen", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockGreen",
						type: "XML"
					},
					Expanded: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockGreen",
						type: "XML"
					}
				}
			}
		});

		return BlockGreen;

	});
