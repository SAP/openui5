sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pending', './v4/pending'], function (Theme, pending$2, pending$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? pending$1 : pending$2;
	var pending = { pathData };

	return pending;

});
