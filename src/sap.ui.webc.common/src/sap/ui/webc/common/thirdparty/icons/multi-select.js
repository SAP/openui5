sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multi-select', './v4/multi-select'], function (Theme, multiSelect$2, multiSelect$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? multiSelect$1 : multiSelect$2;
	var multiSelect = { pathData };

	return multiSelect;

});
