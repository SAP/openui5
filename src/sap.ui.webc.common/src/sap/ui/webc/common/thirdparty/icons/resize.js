sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/resize', './v4/resize'], function (Theme, resize$2, resize$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? resize$1 : resize$2;
	var resize = { pathData };

	return resize;

});
