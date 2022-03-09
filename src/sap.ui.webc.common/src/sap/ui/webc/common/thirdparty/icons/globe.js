sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/globe', './v4/globe'], function (Theme, globe$2, globe$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? globe$1 : globe$2;
	var globe = { pathData };

	return globe;

});
