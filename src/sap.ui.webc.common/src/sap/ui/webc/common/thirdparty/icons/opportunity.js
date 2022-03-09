sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/opportunity', './v4/opportunity'], function (Theme, opportunity$2, opportunity$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? opportunity$1 : opportunity$2;
	var opportunity = { pathData };

	return opportunity;

});
