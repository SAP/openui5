sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/initiative', './v4/initiative'], function (Theme, initiative$2, initiative$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? initiative$1 : initiative$2;
	var initiative = { pathData };

	return initiative;

});
