sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cause', './v4/cause'], function (Theme, cause$2, cause$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cause$1 : cause$2;
	var cause = { pathData };

	return cause;

});
