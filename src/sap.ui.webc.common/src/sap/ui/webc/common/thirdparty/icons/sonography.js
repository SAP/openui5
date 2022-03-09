sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sonography', './v4/sonography'], function (Theme, sonography$2, sonography$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sonography$1 : sonography$2;
	var sonography = { pathData };

	return sonography;

});
