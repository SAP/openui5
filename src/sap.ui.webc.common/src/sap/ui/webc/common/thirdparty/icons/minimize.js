sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/minimize', './v4/minimize'], function (Theme, minimize$2, minimize$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? minimize$1 : minimize$2;
	var minimize = { pathData };

	return minimize;

});
