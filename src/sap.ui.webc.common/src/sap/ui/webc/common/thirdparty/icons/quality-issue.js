sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/quality-issue', './v4/quality-issue'], function (exports, Theme, qualityIssue$1, qualityIssue$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? qualityIssue$1.pathData : qualityIssue$2.pathData;
	var qualityIssue = "quality-issue";

	exports.accData = qualityIssue$1.accData;
	exports.ltr = qualityIssue$1.ltr;
	exports.default = qualityIssue;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
