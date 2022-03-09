sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/translate', './v4/translate'], function (Theme, translate$2, translate$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? translate$1 : translate$2;
	var translate = { pathData };

	return translate;

});
