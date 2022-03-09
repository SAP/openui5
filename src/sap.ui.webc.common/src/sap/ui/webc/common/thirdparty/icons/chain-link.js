sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chain-link', './v4/chain-link'], function (Theme, chainLink$2, chainLink$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? chainLink$1 : chainLink$2;
	var chainLink = { pathData };

	return chainLink;

});
