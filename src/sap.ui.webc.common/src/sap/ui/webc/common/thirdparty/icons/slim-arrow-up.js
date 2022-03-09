sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/slim-arrow-up', './v4/slim-arrow-up'], function (Theme, slimArrowUp$2, slimArrowUp$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? slimArrowUp$1 : slimArrowUp$2;
	var slimArrowUp = { pathData };

	return slimArrowUp;

});
