sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cancel-share', './v4/cancel-share'], function (Theme, cancelShare$2, cancelShare$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cancelShare$1 : cancelShare$2;
	var cancelShare = { pathData };

	return cancelShare;

});
