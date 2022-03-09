sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sum', './v4/sum'], function (Theme, sum$2, sum$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sum$1 : sum$2;
	var sum = { pathData };

	return sum;

});
