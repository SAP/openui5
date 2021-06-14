sap.ui.define([
	"./thirdparty/base/config/Theme",
	"./thirdparty/base/config/Language"
], function(Theme, Language) {
	"use strict";

	var Configuration = {
		getTheme: Theme.getTheme,
		setTheme: Theme.setTheme,
		getLanguage: Language.getLanguage,
		setLanguage: Language.setLanguage
	};

	return Configuration;
});
