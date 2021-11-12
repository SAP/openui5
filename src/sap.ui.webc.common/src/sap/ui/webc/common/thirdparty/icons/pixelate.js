sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pixelate', './v4/pixelate'], function (Theme, pixelate$2, pixelate$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? pixelate$1 : pixelate$2;
	var pixelate = { pathData };

	return pixelate;

});
