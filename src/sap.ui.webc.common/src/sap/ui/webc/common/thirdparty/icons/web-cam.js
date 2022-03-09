sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/web-cam', './v4/web-cam'], function (Theme, webCam$2, webCam$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? webCam$1 : webCam$2;
	var webCam = { pathData };

	return webCam;

});
