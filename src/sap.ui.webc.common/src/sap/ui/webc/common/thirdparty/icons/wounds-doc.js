sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/wounds-doc', './v4/wounds-doc'], function (Theme, woundsDoc$2, woundsDoc$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? woundsDoc$1 : woundsDoc$2;
	var woundsDoc = { pathData };

	return woundsDoc;

});
