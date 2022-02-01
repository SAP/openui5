sap.ui.define(['../asset-registries/Themes', '../ManagedStyles', './getThemeDesignerTheme', './ThemeLoaded', '../FeaturesRegistry'], function (Themes, ManagedStyles, getThemeDesignerTheme, ThemeLoaded, FeaturesRegistry) { 'use strict';

	const BASE_THEME_PACKAGE = "@ui5/webcomponents-theming";
	const isThemeBaseRegistered = () => {
		const registeredPackages = Themes.getRegisteredPackages();
		return registeredPackages.has(BASE_THEME_PACKAGE);
	};
	const loadThemeBase = async theme => {
		if (!isThemeBaseRegistered()) {
			return;
		}
		const cssData = await Themes.getThemeProperties(BASE_THEME_PACKAGE, theme);
		if (cssData) {
			ManagedStyles.createOrUpdateStyle(cssData, "data-ui5-theme-properties", BASE_THEME_PACKAGE);
		}
	};
	const deleteThemeBase = () => {
		ManagedStyles.removeStyle("data-ui5-theme-properties", BASE_THEME_PACKAGE);
	};
	const loadComponentPackages = async theme => {
		const registeredPackages = Themes.getRegisteredPackages();
		registeredPackages.forEach(async packageName => {
			if (packageName === BASE_THEME_PACKAGE) {
				return;
			}
			const cssData = await Themes.getThemeProperties(packageName, theme);
			if (cssData) {
				ManagedStyles.createOrUpdateStyle(cssData, "data-ui5-theme-properties", packageName);
			}
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
