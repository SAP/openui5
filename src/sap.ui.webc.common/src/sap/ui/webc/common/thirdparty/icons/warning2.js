sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/warning2', './v4/warning2'], function (Theme, warning2$2, warning2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? warning2$1 : warning2$2;
	var warning2 = { pathData };

	return warning2;

});
