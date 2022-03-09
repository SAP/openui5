sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arrow-top', './v4/arrow-top'], function (Theme, arrowTop$2, arrowTop$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? arrowTop$1 : arrowTop$2;
	var arrowTop = { pathData };

	return arrowTop;

});
