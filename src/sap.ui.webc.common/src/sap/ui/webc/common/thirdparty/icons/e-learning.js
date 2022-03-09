sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/e-learning', './v4/e-learning'], function (Theme, eLearning$2, eLearning$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? eLearning$1 : eLearning$2;
	var eLearning = { pathData };

	return eLearning;

});
