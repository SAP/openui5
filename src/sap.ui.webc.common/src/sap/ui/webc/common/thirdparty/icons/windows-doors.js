sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/windows-doors', './v4/windows-doors'], function (Theme, windowsDoors$2, windowsDoors$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? windowsDoors$1 : windowsDoors$2;
	var windowsDoors = { pathData };

	return windowsDoors;

});
