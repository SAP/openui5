sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/explorer', './v4/explorer'], function (Theme, explorer$2, explorer$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? explorer$1 : explorer$2;
	var explorer = { pathData };

	return explorer;

});
