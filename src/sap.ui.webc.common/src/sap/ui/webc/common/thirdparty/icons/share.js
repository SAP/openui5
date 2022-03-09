sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/share', './v4/share'], function (Theme, share$2, share$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? share$1 : share$2;
	var share = { pathData };

	return share;

});
