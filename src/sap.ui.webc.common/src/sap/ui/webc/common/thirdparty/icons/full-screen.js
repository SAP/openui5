sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/full-screen', './v4/full-screen'], function (Theme, fullScreen$2, fullScreen$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? fullScreen$1 : fullScreen$2;
	var fullScreen = { pathData };

	return fullScreen;

});
