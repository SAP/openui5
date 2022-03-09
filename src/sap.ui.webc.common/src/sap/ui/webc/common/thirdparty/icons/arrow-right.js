sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arrow-right', './v4/arrow-right'], function (Theme, arrowRight$2, arrowRight$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? arrowRight$1 : arrowRight$2;
	var arrowRight = { pathData };

	return arrowRight;

});
