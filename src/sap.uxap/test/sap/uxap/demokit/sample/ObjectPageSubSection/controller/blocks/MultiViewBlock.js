sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	return BlockBase.extend("sap.uxap.sample.ObjectPageSubSection.view.blocks.MultiViewBlockCollapsed", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.ObjectPageSubSection.view.blocks.MultiViewBlockCollapsed",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.ObjectPageSubSection.view.blocks.MultiViewBlockExpanded",
					type: "XML"
				}
			}
		}
	});
});
