sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/overflow', './v4/overflow'], function (Theme, overflow$2, overflow$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? overflow$1 : overflow$2;
	var overflow = { pathData };

	return overflow;

});
