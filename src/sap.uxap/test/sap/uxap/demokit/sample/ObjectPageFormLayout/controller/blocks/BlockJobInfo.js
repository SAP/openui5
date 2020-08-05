sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
	"use strict";
	return BlockBase.extend("sap.uxap.sample.ObjectPageFormLayout.view.blocks.BlockJobInfo", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.ObjectPageFormLayout.view.blocks.BlockJobInfo",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.ObjectPageFormLayout.view.blocks.BlockJobInfo",
					type: "XML"
				}
			}
		}
	});
});
