sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/blur', './v4/blur'], function (Theme, blur$2, blur$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? blur$1 : blur$2;
	var blur = { pathData };

	return blur;

});
