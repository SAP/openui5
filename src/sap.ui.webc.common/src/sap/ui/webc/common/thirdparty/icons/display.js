sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/display', './v4/display'], function (Theme, display$2, display$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? display$1 : display$2;
	var display = { pathData };

	return display;

});
