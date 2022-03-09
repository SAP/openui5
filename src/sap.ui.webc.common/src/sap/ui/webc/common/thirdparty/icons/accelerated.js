sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/accelerated', './v4/accelerated'], function (Theme, accelerated$2, accelerated$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? accelerated$1 : accelerated$2;
	var accelerated = { pathData };

	return accelerated;

});
