sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/back-to-top', './v4/back-to-top'], function (Theme, backToTop$2, backToTop$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? backToTop$1 : backToTop$2;
	var backToTop = { pathData };

	return backToTop;

});
