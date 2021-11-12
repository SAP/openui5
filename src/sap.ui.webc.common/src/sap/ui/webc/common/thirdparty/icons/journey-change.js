sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/journey-change', './v4/journey-change'], function (Theme, journeyChange$2, journeyChange$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? journeyChange$1 : journeyChange$2;
	var journeyChange = { pathData };

	return journeyChange;

});
