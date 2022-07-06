sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tools-opportunity', './v4/tools-opportunity'], function (exports, Theme, toolsOpportunity$1, toolsOpportunity$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? toolsOpportunity$1.pathData : toolsOpportunity$2.pathData;
	var toolsOpportunity = "tools-opportunity";

	exports.accData = toolsOpportunity$1.accData;
	exports.ltr = toolsOpportunity$1.ltr;
	exports.default = toolsOpportunity;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
