sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/broken-link', './v4/broken-link'], function (Theme, brokenLink$2, brokenLink$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? brokenLink$1 : brokenLink$2;
	var brokenLink = { pathData };

	return brokenLink;

});
