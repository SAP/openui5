sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	return BlockBase.extend("sap.uxap.sample.ObjectPageSubSectionMultiView.view.blocks.BlockEmpty", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.ObjectPageSubSectionMultiView.view.blocks.BlockEmpty",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.ObjectPageSubSectionMultiView.view.blocks.BlockEmpty",
					type: "XML"
				}
			}
		}
	});
});
