sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sorting-ranking', './v4/sorting-ranking'], function (exports, Theme, sortingRanking$1, sortingRanking$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sortingRanking$1.pathData : sortingRanking$2.pathData;
	var sortingRanking = "sorting-ranking";

	exports.accData = sortingRanking$1.accData;
	exports.ltr = sortingRanking$1.ltr;
	exports.default = sortingRanking;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
