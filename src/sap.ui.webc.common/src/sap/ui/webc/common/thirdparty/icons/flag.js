sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/flag', './v4/flag'], function (Theme, flag$2, flag$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? flag$1 : flag$2;
	var flag = { pathData };

	return flag;

});
