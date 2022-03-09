sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/customize', './v4/customize'], function (Theme, customize$2, customize$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? customize$1 : customize$2;
	var customize = { pathData };

	return customize;

});
