sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var MultiViewBlock = BlockBase.extend("sap.uxap.sample.ObjectPageSubSection.MultiViewBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.sample.ObjectPageSubSection.MultiViewBlockCollapsed",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.sample.ObjectPageSubSection.MultiViewBlockExpanded",
					type: "XML"
				}
			}
		}
	});

	return MultiViewBlock;
}, true);
