sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var BlockBlue = BlockBase.extend("sap.uxap.sample.SharedBlocks.BlockBlue", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlue",
						type: "XML"
					},
					Expanded: {
						viewName: "sap.uxap.sample.SharedBlocks.BlockBlue",
						type: "XML"
					}
				}
			}
		});

		return BlockBlue;

	});
