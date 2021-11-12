sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/badge', './v4/badge'], function (Theme, badge$2, badge$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? badge$1 : badge$2;
	var badge = { pathData };

	return badge;

});
