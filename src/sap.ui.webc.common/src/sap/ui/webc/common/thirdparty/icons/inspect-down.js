sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/inspect-down', './v4/inspect-down'], function (Theme, inspectDown$2, inspectDown$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? inspectDown$1 : inspectDown$2;
	var inspectDown = { pathData };

	return inspectDown;

});
