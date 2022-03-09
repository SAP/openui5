sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/stethoscope', './v4/stethoscope'], function (Theme, stethoscope$2, stethoscope$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? stethoscope$1 : stethoscope$2;
	var stethoscope = { pathData };

	return stethoscope;

});
