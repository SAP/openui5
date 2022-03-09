sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/exit-full-screen', './v4/exit-full-screen'], function (Theme, exitFullScreen$2, exitFullScreen$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? exitFullScreen$1 : exitFullScreen$2;
	var exitFullScreen = { pathData };

	return exitFullScreen;

});
