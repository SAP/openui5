sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/project-definition-triangle', './v4/project-definition-triangle'], function (Theme, projectDefinitionTriangle$2, projectDefinitionTriangle$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? projectDefinitionTriangle$1 : projectDefinitionTriangle$2;
	var projectDefinitionTriangle = { pathData };

	return projectDefinitionTriangle;

});
