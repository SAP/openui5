sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tools-opportunity', './v4/tools-opportunity'], function (Theme, toolsOpportunity$2, toolsOpportunity$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? toolsOpportunity$1 : toolsOpportunity$2;
	var toolsOpportunity = { pathData };

	return toolsOpportunity;

});
