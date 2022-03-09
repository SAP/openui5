sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/move', './v4/move'], function (Theme, move$2, move$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? move$1 : move$2;
	var move = { pathData };

	return move;

});
