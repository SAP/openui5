sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/future', './v4/future'], function (Theme, future$2, future$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? future$1 : future$2;
	var future = { pathData };

	return future;

});
