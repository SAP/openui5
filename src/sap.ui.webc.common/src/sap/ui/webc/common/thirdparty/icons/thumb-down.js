sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/thumb-down', './v4/thumb-down'], function (Theme, thumbDown$2, thumbDown$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? thumbDown$1 : thumbDown$2;
	var thumbDown = { pathData };

	return thumbDown;

});
