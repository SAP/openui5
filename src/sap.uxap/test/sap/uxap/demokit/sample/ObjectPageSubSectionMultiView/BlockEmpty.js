sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockEmpty = BlockBase.extend("sap.uxap.sample.ObjectPageSubSectionMultiView.BlockEmpty", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.ObjectPageSubSectionMultiView.BlockEmpty",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.ObjectPageSubSectionMultiView.BlockEmpty",
					type: "XML"
				}
			}
		}
	});
	return BlockEmpty;
});
