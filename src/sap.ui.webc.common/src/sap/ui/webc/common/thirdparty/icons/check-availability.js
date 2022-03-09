sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/check-availability', './v4/check-availability'], function (Theme, checkAvailability$2, checkAvailability$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? checkAvailability$1 : checkAvailability$2;
	var checkAvailability = { pathData };

	return checkAvailability;

});
