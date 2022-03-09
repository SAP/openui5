sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/fob-watch', './v4/fob-watch'], function (Theme, fobWatch$2, fobWatch$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? fobWatch$1 : fobWatch$2;
	var fobWatch = { pathData };

	return fobWatch;

});
