sap.ui.define(['exports', '../InitialConfiguration', './Language', '../util/getDesigntimePropertyAsArray', '../util/detectNavigatorLanguage'], function (exports, InitialConfiguration, Language, getDesigntimePropertyAsArray, detectNavigatorLanguage) { 'use strict';

	const M_ISO639_OLD_TO_NEW = {
		"iw": "he",
		"ji": "yi",
		"in": "id",
		"sh": "sr",
	};
	const A_RTL_LOCALES = getDesigntimePropertyAsArray("$cldr-rtl-locales:ar,fa,he$") || [];
	const impliesRTL = language => {
		language = (language && M_ISO639_OLD_TO_NEW[language]) || language;
		return A_RTL_LOCALES.indexOf(language) >= 0;
	};
	const getRTL = () => {
		const configurationRTL = InitialConfiguration.getRTL();
		if (configurationRTL !== null) {
			return !!configurationRTL;
		}
		return impliesRTL(Language.getLanguage() || detectNavigatorLanguage());
	};

	exports.getRTL = getRTL;

	Object.defineProperty(exports, '__esModule', { value: true });

});
