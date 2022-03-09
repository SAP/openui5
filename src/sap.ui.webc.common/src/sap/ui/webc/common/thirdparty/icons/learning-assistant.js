sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/learning-assistant', './v4/learning-assistant'], function (Theme, learningAssistant$2, learningAssistant$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? learningAssistant$1 : learningAssistant$2;
	var learningAssistant = { pathData };

	return learningAssistant;

});
