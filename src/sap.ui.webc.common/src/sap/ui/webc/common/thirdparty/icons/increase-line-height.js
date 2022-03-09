sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/increase-line-height', './v4/increase-line-height'], function (Theme, increaseLineHeight$2, increaseLineHeight$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? increaseLineHeight$1 : increaseLineHeight$2;
	var increaseLineHeight = { pathData };

	return increaseLineHeight;

});
