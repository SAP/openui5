sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/journey-arrive', './v4/journey-arrive'], function (Theme, journeyArrive$2, journeyArrive$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? journeyArrive$1 : journeyArrive$2;
	var journeyArrive = { pathData };

	return journeyArrive;

});
