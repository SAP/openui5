sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/s4hana', './v4/s4hana'], function (Theme, s4hana$2, s4hana$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? s4hana$1 : s4hana$2;
	var s4hana = { pathData };

	return s4hana;

});
