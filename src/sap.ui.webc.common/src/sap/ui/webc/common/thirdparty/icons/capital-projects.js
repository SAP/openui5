sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/capital-projects', './v4/capital-projects'], function (exports, Theme, capitalProjects$1, capitalProjects$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? capitalProjects$1.pathData : capitalProjects$2.pathData;
	var capitalProjects = "capital-projects";

	exports.accData = capitalProjects$1.accData;
	exports.ltr = capitalProjects$1.ltr;
	exports.default = capitalProjects;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
