sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/project-definition-triangle', './v4/project-definition-triangle'], function (exports, Theme, projectDefinitionTriangle$1, projectDefinitionTriangle$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? projectDefinitionTriangle$1.pathData : projectDefinitionTriangle$2.pathData;
	var projectDefinitionTriangle = "project-definition-triangle";

	exports.accData = projectDefinitionTriangle$1.accData;
	exports.ltr = projectDefinitionTriangle$1.ltr;
	exports.default = projectDefinitionTriangle;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
