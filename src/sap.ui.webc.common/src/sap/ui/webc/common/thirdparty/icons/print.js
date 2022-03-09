sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/print', './v4/print'], function (Theme, print$2, print$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? print$1 : print$2;
	var print = { pathData };

	return print;

});
