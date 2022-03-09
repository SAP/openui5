sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/paint-bucket', './v4/paint-bucket'], function (Theme, paintBucket$2, paintBucket$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? paintBucket$1 : paintBucket$2;
	var paintBucket = { pathData };

	return paintBucket;

});
