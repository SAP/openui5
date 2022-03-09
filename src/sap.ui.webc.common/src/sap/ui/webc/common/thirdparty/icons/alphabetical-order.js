sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/alphabetical-order', './v4/alphabetical-order'], function (Theme, alphabeticalOrder$2, alphabeticalOrder$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? alphabeticalOrder$1 : alphabeticalOrder$2;
	var alphabeticalOrder = { pathData };

	return alphabeticalOrder;

});
