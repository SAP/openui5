sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/factory', './v4/factory'], function (Theme, factory$2, factory$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? factory$1 : factory$2;
	var factory = { pathData };

	return factory;

});
