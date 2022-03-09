sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/synchronize', './v4/synchronize'], function (Theme, synchronize$2, synchronize$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? synchronize$1 : synchronize$2;
	var synchronize = { pathData };

	return synchronize;

});
