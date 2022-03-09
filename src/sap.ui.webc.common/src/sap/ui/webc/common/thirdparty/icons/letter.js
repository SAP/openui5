sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/letter', './v4/letter'], function (Theme, letter$2, letter$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? letter$1 : letter$2;
	var letter = { pathData };

	return letter;

});
