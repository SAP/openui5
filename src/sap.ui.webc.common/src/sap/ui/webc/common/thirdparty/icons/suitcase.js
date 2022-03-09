sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/suitcase', './v4/suitcase'], function (Theme, suitcase$2, suitcase$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? suitcase$1 : suitcase$2;
	var suitcase = { pathData };

	return suitcase;

});
