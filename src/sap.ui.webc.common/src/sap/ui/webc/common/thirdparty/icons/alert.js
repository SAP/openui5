sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/alert', './v4/alert'], function (Theme, alert$2, alert$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? alert$1 : alert$2;
	var alert = { pathData };

	return alert;

});
