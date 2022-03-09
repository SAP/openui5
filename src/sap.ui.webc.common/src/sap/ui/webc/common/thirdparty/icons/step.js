sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/step', './v4/step'], function (Theme, step$2, step$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? step$1 : step$2;
	var step = { pathData };

	return step;

});
