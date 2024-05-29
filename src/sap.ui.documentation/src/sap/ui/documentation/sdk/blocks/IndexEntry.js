/*!
 * ${copyright}
 */
sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase, formatter) {
		"use strict";

		var BlockBlue = BlockBase.extend("sap.ui.documentation.sdk.blocks.IndexEntry", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "sap.ui.documentation.sdk.blocks.IndexEntry",
						type: "XML"
					},
					Expanded: {
						viewName: "sap.ui.documentation.sdk.blocks.IndexEntry",
						type: "XML"
					}
				}
			}
		});

		return BlockBlue;

	});
