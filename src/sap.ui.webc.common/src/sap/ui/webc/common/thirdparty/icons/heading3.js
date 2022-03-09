sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heading3', './v4/heading3'], function (Theme, heading3$2, heading3$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? heading3$1 : heading3$2;
	var heading3 = { pathData };

	return heading3;

});
