sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/subway-train', './v4/subway-train'], function (Theme, subwayTrain$2, subwayTrain$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? subwayTrain$1 : subwayTrain$2;
	var subwayTrain = { pathData };

	return subwayTrain;

});
