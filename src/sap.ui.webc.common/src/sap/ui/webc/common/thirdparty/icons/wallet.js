sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/wallet', './v4/wallet'], function (Theme, wallet$2, wallet$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? wallet$1 : wallet$2;
	var wallet = { pathData };

	return wallet;

});
