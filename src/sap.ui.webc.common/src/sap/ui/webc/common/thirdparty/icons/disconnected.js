sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/disconnected', './v4/disconnected'], function (Theme, disconnected$2, disconnected$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? disconnected$1 : disconnected$2;
	var disconnected = { pathData };

	return disconnected;

});
