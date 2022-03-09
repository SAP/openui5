sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/competitor', './v4/competitor'], function (Theme, competitor$2, competitor$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? competitor$1 : competitor$2;
	var competitor = { pathData };

	return competitor;

});
