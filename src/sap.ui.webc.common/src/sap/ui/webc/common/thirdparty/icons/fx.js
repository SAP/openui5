sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/fx', './v4/fx'], function (Theme, fx$2, fx$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? fx$1 : fx$2;
	var fx = { pathData };

	return fx;

});
