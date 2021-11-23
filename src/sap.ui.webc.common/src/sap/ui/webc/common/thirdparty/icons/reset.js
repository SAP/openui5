sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/reset', './v4/reset'], function (Theme, reset$2, reset$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? reset$1 : reset$2;
	var reset = { pathData };

	return reset;

});
