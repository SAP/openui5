sap.ui.define([
    'exports',
    '../asset-registries/Themes',
    '../ManagedStyles',
    './getThemeDesignerTheme',
    './ThemeLoaded',
    '../FeaturesRegistry',
    '../config/ThemeRoot',
    '../generated/AssetParameters',
    '../Runtimes'
], function (_exports, _Themes, _ManagedStyles, _getThemeDesignerTheme, _ThemeLoaded, _FeaturesRegistry, _ThemeRoot, _AssetParameters, _Runtimes) {
    'use strict';
    Object.defineProperty(_exports, '__esModule', { value: true });
    _exports.default = void 0;
    _getThemeDesignerTheme = _interopRequireDefault(_getThemeDesignerTheme);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    const BASE_THEME_PACKAGE = '@ui5/webcomponents-theming';
    const isThemeBaseRegistered = () => {
        const registeredPackages = (0, _Themes.getRegisteredPackages)();
        return registeredPackages.has(BASE_THEME_PACKAGE);
    };
    const loadThemeBase = async theme => {
        if (!isThemeBaseRegistered()) {
            return;
        }
        const cssData = await (0, _Themes.getThemeProperties)(BASE_THEME_PACKAGE, theme);
        if (cssData) {
            (0, _ManagedStyles.createOrUpdateStyle)(cssData, 'data-ui5-theme-properties', BASE_THEME_PACKAGE);
        }
    };
    const deleteThemeBase = () => {
        (0, _ManagedStyles.removeStyle)('data-ui5-theme-properties', BASE_THEME_PACKAGE);
    };
    const loadComponentPackages = async theme => {
        const registeredPackages = (0, _Themes.getRegisteredPackages)();
        const packagesStylesPromises = [...registeredPackages].map(async packageName => {
            if (packageName === BASE_THEME_PACKAGE) {
                return;
            }
            const cssData = await (0, _Themes.getThemeProperties)(packageName, theme);
            if (cssData) {
                (0, _ManagedStyles.createOrUpdateStyle)(cssData, `data-ui5-component-properties-${ (0, _Runtimes.getCurrentRuntimeIndex)() }`, packageName);
            }
        });
        return Promise.all(packagesStylesPromises);
    };
    const detectExternalTheme = async theme => {
        const extTheme = (0, _getThemeDesignerTheme.default)();
        if (extTheme) {
            return extTheme;
        }
        const openUI5Support = (0, _FeaturesRegistry.getFeature)('OpenUI5Support');
        if (openUI5Support && openUI5Support.isOpenUI5Detected()) {
            const varsLoaded = openUI5Support.cssVariablesLoaded();
            if (varsLoaded) {
                return {
                    themeName: openUI5Support.getConfigurationSettingsObject()?.theme,
                    baseThemeName: ''
                };
            }
        } else if ((0, sap.ui.require('sap/ui/webc/common/thirdparty/base/config/ThemeRoot').getThemeRoot)()) {
            await (0, sap.ui.require('sap/ui/webc/common/thirdparty/base/config/ThemeRoot').attachCustomThemeStylesToHead)(theme);
            return (0, _getThemeDesignerTheme.default)();
        }
    };
    const applyTheme = async theme => {
        const extTheme = await detectExternalTheme(theme);
        if (!extTheme || theme !== extTheme.themeName) {
            await loadThemeBase(theme);
        } else {
            deleteThemeBase();
        }
        const packagesTheme = (0, _Themes.isThemeRegistered)(theme) ? theme : extTheme && extTheme.baseThemeName;
        await loadComponentPackages(packagesTheme || _AssetParameters.DEFAULT_THEME);
        (0, _ThemeLoaded.fireThemeLoaded)(theme);
    };
    var _default = applyTheme;
    _exports.default = _default;
});