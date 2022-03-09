sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/accidental-leave', './v4/accidental-leave'], function (Theme, accidentalLeave$2, accidentalLeave$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? accidentalLeave$1 : accidentalLeave$2;
	var accidentalLeave = { pathData };

	return accidentalLeave;

});
