sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/accept', './v4/accept'], function (Theme, accept$2, accept$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? accept$1 : accept$2;
	var accept = { pathData };

	return accept;

});
