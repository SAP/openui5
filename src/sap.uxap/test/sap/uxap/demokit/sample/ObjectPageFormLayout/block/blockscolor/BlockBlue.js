sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("sap.uxap.sample.ObjectPageFormLayout.block.blockscolor.BlockBlue", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.ObjectPageFormLayout.block.blockscolor.BlockBlue",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.ObjectPageFormLayout.block.blockscolor.BlockBlue",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);
