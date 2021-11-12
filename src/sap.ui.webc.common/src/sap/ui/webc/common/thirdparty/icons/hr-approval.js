sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/hr-approval', './v4/hr-approval'], function (Theme, hrApproval$2, hrApproval$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? hrApproval$1 : hrApproval$2;
	var hrApproval = { pathData };

	return hrApproval;

});
