sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bell', './v4/bell'], function (Theme, bell$2, bell$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? bell$1 : bell$2;
	var bell = { pathData };

	return bell;

});
