sap.ui.define([
    'exports',
    '../util/createLinkInHead',
    '../validateThemeRoot',
    '../InitialConfiguration',
    './Theme'
], function (_exports, _createLinkInHead, _validateThemeRoot, _InitialConfiguration, _Theme) {
    'use strict';
    Object.defineProperty(_exports, '__esModule', { value: true });
    _exports.setThemeRoot = _exports.getThemeRoot = _exports.attachCustomThemeStylesToHead = void 0;
    _createLinkInHead = _interopRequireDefault(_createLinkInHead);
    _validateThemeRoot = _interopRequireDefault(_validateThemeRoot);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    let currThemeRoot;
    const getThemeRoot = () => {
        if (currThemeRoot === undefined) {
            currThemeRoot = (0, _InitialConfiguration.getThemeRoot)();
        }
        return currThemeRoot;
    };
    _exports.getThemeRoot = getThemeRoot;
    const setThemeRoot = themeRoot => {
        if (currThemeRoot === themeRoot) {
            return;
        }
        currThemeRoot = themeRoot;
        if (!(0, _validateThemeRoot.default)(themeRoot)) {
            console.warn(`The ${ themeRoot } is not valid. Check the allowed origins as suggested in the "setThemeRoot" description.`);
            return;
        }
        return attachCustomThemeStylesToHead((0, sap.ui.require('sap/ui/webc/common/thirdparty/base/config/Theme').getTheme)());
    };
    _exports.setThemeRoot = setThemeRoot;
    const formatThemeLink = theme => {
        return `${ getThemeRoot() }Base/baseLib/${ theme }/css_variables.css`;
    };
    const attachCustomThemeStylesToHead = async theme => {
        const link = document.querySelector(`[sap-ui-webcomponents-theme="${ theme }"]`);
        if (link) {
            document.head.removeChild(link);
        }
        await (0, _createLinkInHead.default)(formatThemeLink(theme), { 'sap-ui-webcomponents-theme': theme });
    };
    _exports.attachCustomThemeStylesToHead = attachCustomThemeStylesToHead;
});