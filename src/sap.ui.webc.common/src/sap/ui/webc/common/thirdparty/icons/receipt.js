sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/receipt', './v4/receipt'], function (Theme, receipt$2, receipt$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? receipt$1 : receipt$2;
	var receipt = { pathData };

	return receipt;

});
