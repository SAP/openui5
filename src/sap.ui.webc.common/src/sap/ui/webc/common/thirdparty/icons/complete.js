sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/complete', './v4/complete'], function (Theme, complete$2, complete$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? complete$1 : complete$2;
	var complete = { pathData };

	return complete;

});
