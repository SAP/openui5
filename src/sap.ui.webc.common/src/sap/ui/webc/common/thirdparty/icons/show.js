sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/show', './v4/show'], function (Theme, show$2, show$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? show$1 : show$2;
	var show = { pathData };

	return show;

});
