sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/restart', './v4/restart'], function (Theme, restart$2, restart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? restart$1 : restart$2;
	var restart = { pathData };

	return restart;

});
