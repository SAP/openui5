sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/information', './v4/information'], function (Theme, information$2, information$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? information$1 : information$2;
	var information = { pathData };

	return information;

});
