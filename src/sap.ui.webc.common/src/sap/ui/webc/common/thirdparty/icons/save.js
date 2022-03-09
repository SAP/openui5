sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/save', './v4/save'], function (Theme, save$2, save$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? save$1 : save$2;
	var save = { pathData };

	return save;

});
