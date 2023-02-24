sap.ui.define(["exports", "./getEffectiveLinksHrefs", "../util/createLinkInHead", "../CSP"], function (_exports, _getEffectiveLinksHrefs, _createLinkInHead, _CSP) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _getEffectiveLinksHrefs = _interopRequireDefault(_getEffectiveLinksHrefs);
  _createLinkInHead = _interopRequireDefault(_createLinkInHead);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const preloaded = new Set();
  const preloadLinks = ElementClass => {
    if (!(0, _CSP.shouldUseLinks)() || !(0, _CSP.shouldPreloadLinks)()) {
      return;
    }
    const linksHrefs = (0, _getEffectiveLinksHrefs.default)(ElementClass, false) || [];
    const staticAreaLinksHrefs = (0, _getEffectiveLinksHrefs.default)(ElementClass, true) || [];
    [...linksHrefs, ...staticAreaLinksHrefs].forEach(href => {
      if (!preloaded.has(href)) {
        (0, _createLinkInHead.default)(href, {
          rel: "preload",
          as: "style"
        });
        preloaded.add(href);
      }
    });
  };
  var _default = preloadLinks;
  _exports.default = _default;
});