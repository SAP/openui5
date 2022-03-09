sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pull-down', './v4/pull-down'], function (Theme, pullDown$2, pullDown$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pullDown$1 : pullDown$2;
	var pullDown = { pathData };

	return pullDown;

});
