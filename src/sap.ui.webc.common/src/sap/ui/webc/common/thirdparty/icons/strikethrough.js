sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/strikethrough', './v4/strikethrough'], function (Theme, strikethrough$2, strikethrough$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? strikethrough$1 : strikethrough$2;
	var strikethrough = { pathData };

	return strikethrough;

});
