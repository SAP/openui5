sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heading2', './v4/heading2'], function (Theme, heading2$2, heading2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? heading2$1 : heading2$2;
	var heading2 = { pathData };

	return heading2;

});
