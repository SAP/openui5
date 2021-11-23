sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/it-host', './v4/it-host'], function (Theme, itHost$2, itHost$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? itHost$1 : itHost$2;
	var itHost = { pathData };

	return itHost;

});
