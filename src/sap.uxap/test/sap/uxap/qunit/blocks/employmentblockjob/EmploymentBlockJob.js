sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";
	var myBlock = BlockBase.extend("sap.uxap.testblocks.employmentblockjob.EmploymentBlockJob", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.uxap.testblocks.employmentblockjob.EmploymentBlockJobCollapsed",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.uxap.testblocks.employmentblockjob.EmploymentBlockJobExpanded",
					type: "XML"
				}
			}
		}
	});
	return myBlock;
}, true);
