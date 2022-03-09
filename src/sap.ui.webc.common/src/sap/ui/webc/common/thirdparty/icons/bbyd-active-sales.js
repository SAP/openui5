sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bbyd-active-sales', './v4/bbyd-active-sales'], function (Theme, bbydActiveSales$2, bbydActiveSales$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bbydActiveSales$1 : bbydActiveSales$2;
	var bbydActiveSales = { pathData };

	return bbydActiveSales;

});
