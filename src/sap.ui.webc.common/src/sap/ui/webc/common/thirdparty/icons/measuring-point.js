sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/measuring-point', './v4/measuring-point'], function (Theme, measuringPoint$2, measuringPoint$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? measuringPoint$1 : measuringPoint$2;
	var measuringPoint = { pathData };

	return measuringPoint;

});
