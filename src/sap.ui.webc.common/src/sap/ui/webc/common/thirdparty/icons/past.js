sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/past', './v4/past'], function (Theme, past$2, past$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? past$1 : past$2;
	var past = { pathData };

	return past;

});
