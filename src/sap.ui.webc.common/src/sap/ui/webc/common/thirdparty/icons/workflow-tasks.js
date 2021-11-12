sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/workflow-tasks', './v4/workflow-tasks'], function (Theme, workflowTasks$2, workflowTasks$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? workflowTasks$1 : workflowTasks$2;
	var workflowTasks = { pathData };

	return workflowTasks;

});
