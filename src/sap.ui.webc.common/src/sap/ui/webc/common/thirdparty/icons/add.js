sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add', './v4/add'], function (Theme, add$2, add$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? add$1 : add$2;
	var add = { pathData };

	return add;

});
