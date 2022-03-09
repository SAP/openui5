sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/busy', './v4/busy'], function (Theme, busy$2, busy$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? busy$1 : busy$2;
	var busy = { pathData };

	return busy;

});
