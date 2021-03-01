sap.ui.define(['../asset-registries/Themes', './createThemePropertiesStyleTag', './getThemeDesignerTheme', './ThemeLoaded', '../FeaturesRegistry'], function (Themes, createThemePropertiesStyleTag, getThemeDesignerTheme, ThemeLoaded, FeaturesRegistry) { 'use strict';

	const BASE_THEME_PACKAGE = "@ui5/webcomponents-theme-base";
	const isThemeBaseRegistered = () => {
		const registeredPackages = Themes.getRegisteredPackages();
		return registeredPackages.has(BASE_THEME_PACKAGE);
	};
	const loadThemeBase = async theme => {
		if (!isThemeBaseRegistered()) {
			return;
		}
		const cssText = await Themes.getThemeProperties(BASE_THEME_PACKAGE, theme);
		createThemePropertiesStyleTag(cssText, BASE_THEME_PACKAGE);
	};
	const deleteThemeBase = () => {
		const styleElement = document.head.querySelector(`style[data-ui5-theme-properties="${BASE_THEME_PACKAGE}"]`);
		if (styleElement) {
			styleElement.parentElement.removeChild(styleElement);
		}
	};
	const loadComponentPackages = async theme => {
		const registeredPackages = Themes.getRegisteredPackages();
		registeredPackages.forEach(async packageName => {
			if (packageName === BASE_THEME_PACKAGE) {
				return;
			}
			const cssText = await Themes.getThemeProperties(packageName, theme);
			createThemePropertiesStyleTag(cssText, packageName);
		});
	};
	const detectExternalTheme = () => {
		const extTheme = getThemeDesignerTheme();
		if (extTheme) {
			return extTheme;
		}
		const OpenUI5Support = FeaturesRegistry.getFeature("OpenUI5Support");
		if (OpenUI5Support) {
			const varsLoaded = OpenUI5Support.cssVariablesLoaded();
			if (varsLoaded) {
				return {
					themeName: OpenUI5Support.getConfigurationSettingsObject().theme,
				};
			}
		}
	};
	const applyTheme = async theme => {
		const extTheme = detectExternalTheme();
		if (!extTheme || theme !== extTheme.themeName) {
			await loadThemeBase(theme);
		} else {
			deleteThemeBase();
		}
		const packagesTheme = Themes.isThemeRegistered(theme) ? theme : extTheme && extTheme.baseThemeName;
		await loadComponentPackages(packagesTheme);
		ThemeLoaded.fireThemeLoaded(theme);
	};

	return applyTheme;

});
