sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/expand', './v4/expand'], function (Theme, expand$2, expand$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? expand$1 : expand$2;
	var expand = { pathData };

	return expand;

});
