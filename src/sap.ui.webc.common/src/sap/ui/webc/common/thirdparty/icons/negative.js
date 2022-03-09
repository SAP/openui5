sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/negative', './v4/negative'], function (Theme, negative$2, negative$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? negative$1 : negative$2;
	var negative = { pathData };

	return negative;

});
