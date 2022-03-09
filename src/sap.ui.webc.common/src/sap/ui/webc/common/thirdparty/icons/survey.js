sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/survey', './v4/survey'], function (Theme, survey$2, survey$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? survey$1 : survey$2;
	var survey = { pathData };

	return survey;

});
