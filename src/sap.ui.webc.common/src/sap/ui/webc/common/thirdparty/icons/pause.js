sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pause', './v4/pause'], function (Theme, pause$2, pause$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? pause$1 : pause$2;
	var pause = { pathData };

	return pause;

});
