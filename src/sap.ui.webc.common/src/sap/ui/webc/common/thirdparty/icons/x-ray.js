sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/x-ray', './v4/x-ray'], function (Theme, xRay$2, xRay$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? xRay$1 : xRay$2;
	var xRay = { pathData };

	return xRay;

});
