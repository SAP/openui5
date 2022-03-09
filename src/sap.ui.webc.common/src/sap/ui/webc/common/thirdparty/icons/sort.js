sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sort', './v4/sort'], function (Theme, sort$2, sort$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sort$1 : sort$2;
	var sort = { pathData };

	return sort;

});
