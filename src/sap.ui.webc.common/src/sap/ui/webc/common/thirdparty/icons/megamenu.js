sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/megamenu', './v4/megamenu'], function (Theme, megamenu$2, megamenu$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? megamenu$1 : megamenu$2;
	var megamenu = { pathData };

	return megamenu;

});
