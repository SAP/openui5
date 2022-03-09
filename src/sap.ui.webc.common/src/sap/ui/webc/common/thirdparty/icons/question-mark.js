sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/question-mark', './v4/question-mark'], function (Theme, questionMark$2, questionMark$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? questionMark$1 : questionMark$2;
	var questionMark = { pathData };

	return questionMark;

});
