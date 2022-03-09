sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/slim-arrow-down', './v4/slim-arrow-down'], function (Theme, slimArrowDown$2, slimArrowDown$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? slimArrowDown$1 : slimArrowDown$2;
	var slimArrowDown = { pathData };

	return slimArrowDown;

});
