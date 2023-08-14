sap.ui.define([
    'exports',
    '../InitialConfiguration',
    '../Render',
    '../theming/applyTheme',
    '../theming/getThemeDesignerTheme',
    '../generated/AssetParameters'
], function (_exports, _InitialConfiguration, _Render, _applyTheme, _getThemeDesignerTheme, _AssetParameters) {
    'use strict';
    Object.defineProperty(_exports, '__esModule', { value: true });
    _exports.setTheme = _exports.isTheme = _exports.isLegacyThemeFamily = _exports.getTheme = _exports.getDefaultTheme = void 0;
    _applyTheme = _interopRequireDefault(sap.ui.require('sap/ui/webc/common/thirdparty/base/theming/applyTheme'));
    _getThemeDesignerTheme = _interopRequireDefault(_getThemeDesignerTheme);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    let curTheme;
    const getTheme = () => {
        if (curTheme === undefined) {
            curTheme = (0, _InitialConfiguration.getTheme)();
        }
        return curTheme;
    };
    _exports.getTheme = getTheme;
    const setTheme = async theme => {
        if (curTheme === theme) {
            return;
        }
        curTheme = theme;
        await (0, sap.ui.require('sap/ui/webc/common/thirdparty/base/theming/applyTheme').default)(curTheme);
        await (0, _Render.reRenderAllUI5Elements)({ themeAware: true });
    };
    _exports.setTheme = setTheme;
    const getDefaultTheme = () => {
        return _AssetParameters.DEFAULT_THEME;
    };
    _exports.getDefaultTheme = getDefaultTheme;
    const isTheme = theme => {
        const currentTheme = getTheme();
        return currentTheme === theme || currentTheme === `${ theme }_exp`;
    };
    _exports.isTheme = isTheme;
    const isLegacyThemeFamily = () => {
        const currentTheme = getTheme();
        if (!isKnownTheme(currentTheme)) {
            return !(0, _getThemeDesignerTheme.default)()?.baseThemeName?.startsWith('sap_horizon');
        }
        return !currentTheme.startsWith('sap_horizon');
    };
    _exports.isLegacyThemeFamily = isLegacyThemeFamily;
    const isKnownTheme = theme => _AssetParameters.SUPPORTED_THEMES.includes(theme);
});