sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/workflow-tasks', './v4/workflow-tasks'], function (exports, Theme, workflowTasks$1, workflowTasks$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? workflowTasks$1.pathData : workflowTasks$2.pathData;
	var workflowTasks = "workflow-tasks";

	exports.accData = workflowTasks$1.accData;
	exports.ltr = workflowTasks$1.ltr;
	exports.default = workflowTasks;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
