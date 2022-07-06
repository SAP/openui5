sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/project-definition-triangle-2', './v4/project-definition-triangle-2'], function (exports, Theme, projectDefinitionTriangle2$1, projectDefinitionTriangle2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? projectDefinitionTriangle2$1.pathData : projectDefinitionTriangle2$2.pathData;
	var projectDefinitionTriangle2 = "project-definition-triangle-2";

	exports.accData = projectDefinitionTriangle2$1.accData;
	exports.ltr = projectDefinitionTriangle2$1.ltr;
	exports.default = projectDefinitionTriangle2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
