sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/burglary', './v4/burglary'], function (Theme, burglary$2, burglary$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? burglary$1 : burglary$2;
	var burglary = { pathData };

	return burglary;

});
