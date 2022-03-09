sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/quality-issue', './v4/quality-issue'], function (Theme, qualityIssue$2, qualityIssue$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? qualityIssue$1 : qualityIssue$2;
	var qualityIssue = { pathData };

	return qualityIssue;

});
