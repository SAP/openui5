sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/eam-work-order', './v4/eam-work-order'], function (Theme, eamWorkOrder$2, eamWorkOrder$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? eamWorkOrder$1 : eamWorkOrder$2;
	var eamWorkOrder = { pathData };

	return eamWorkOrder;

});
