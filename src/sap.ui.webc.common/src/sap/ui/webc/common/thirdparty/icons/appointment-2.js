sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/appointment-2', './v4/appointment-2'], function (Theme, appointment2$2, appointment2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? appointment2$1 : appointment2$2;
	var appointment2 = { pathData };

	return appointment2;

});
