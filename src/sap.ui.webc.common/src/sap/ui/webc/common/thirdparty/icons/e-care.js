sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/e-care', './v4/e-care'], function (Theme, eCare$2, eCare$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? eCare$1 : eCare$2;
	var eCare = { pathData };

	return eCare;

});
