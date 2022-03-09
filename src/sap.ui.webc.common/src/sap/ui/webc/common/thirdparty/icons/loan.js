sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/loan', './v4/loan'], function (Theme, loan$2, loan$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? loan$1 : loan$2;
	var loan = { pathData };

	return loan;

});
