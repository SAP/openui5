sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/key', './v4/key'], function (Theme, key$2, key$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? key$1 : key$2;
	var key = { pathData };

	return key;

});
