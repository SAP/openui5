sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/away', './v4/away'], function (Theme, away$2, away$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? away$1 : away$2;
	var away = { pathData };

	return away;

});
