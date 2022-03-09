sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/approvals', './v4/approvals'], function (Theme, approvals$2, approvals$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? approvals$1 : approvals$2;
	var approvals = { pathData };

	return approvals;

});
