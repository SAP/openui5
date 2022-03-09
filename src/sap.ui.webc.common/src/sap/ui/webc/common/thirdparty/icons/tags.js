sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tags', './v4/tags'], function (Theme, tags$2, tags$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tags$1 : tags$2;
	var tags = { pathData };

	return tags;

});
