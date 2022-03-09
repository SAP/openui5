sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/journey-depart', './v4/journey-depart'], function (Theme, journeyDepart$2, journeyDepart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? journeyDepart$1 : journeyDepart$2;
	var journeyDepart = { pathData };

	return journeyDepart;

});
