sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/slim-arrow-right', './v4/slim-arrow-right'], function (Theme, slimArrowRight$2, slimArrowRight$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? slimArrowRight$1 : slimArrowRight$2;
	var slimArrowRight = { pathData };

	return slimArrowRight;

});
