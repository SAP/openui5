sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/connected', './v4/connected'], function (Theme, connected$2, connected$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? connected$1 : connected$2;
	var connected = { pathData };

	return connected;

});
