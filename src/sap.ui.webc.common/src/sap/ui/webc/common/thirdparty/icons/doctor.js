sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/doctor', './v4/doctor'], function (Theme, doctor$2, doctor$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? doctor$1 : doctor$2;
	var doctor = { pathData };

	return doctor;

});
