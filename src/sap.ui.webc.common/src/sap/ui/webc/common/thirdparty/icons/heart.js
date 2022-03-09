sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heart', './v4/heart'], function (Theme, heart$2, heart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? heart$1 : heart$2;
	var heart = { pathData };

	return heart;

});
