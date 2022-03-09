sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/decrease-line-height', './v4/decrease-line-height'], function (Theme, decreaseLineHeight$2, decreaseLineHeight$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? decreaseLineHeight$1 : decreaseLineHeight$2;
	var decreaseLineHeight = { pathData };

	return decreaseLineHeight;

});
