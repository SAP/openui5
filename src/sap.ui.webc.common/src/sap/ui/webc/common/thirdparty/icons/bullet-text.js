sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bullet-text', './v4/bullet-text'], function (Theme, bulletText$2, bulletText$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? bulletText$1 : bulletText$2;
	var bulletText = { pathData };

	return bulletText;

});
