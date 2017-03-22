sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("sap.uxap.sample.ObjectPageFormLayout.block.employment.BlockJobInfo", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.ObjectPageFormLayout.block.employment.BlockJobInfo",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.ObjectPageFormLayout.block.employment.BlockJobInfo",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);
