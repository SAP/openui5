sap.ui.define(["exports", "./util/createStyleInHead", "./util/createLinkInHead", "./CSP"], function (_exports, _createStyleInHead, _createLinkInHead, _CSP) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.updateStyle = _exports.removeStyle = _exports.hasStyle = _exports.createStyle = _exports.createOrUpdateStyle = void 0;
  _createStyleInHead = _interopRequireDefault(_createStyleInHead);
  _createLinkInHead = _interopRequireDefault(_createLinkInHead);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  const getStyleId = (name, value) => {
    return value ? `${name}|${value}` : name;
  };

  const createStyle = (data, name, value = "") => {
    const content = typeof data === "string" ? data : data.content;

    if ((0, _CSP.shouldUseLinks)()) {
      const attributes = {};
      attributes[name] = value;
      const href = (0, _CSP.getUrl)(data.packageName, data.fileName);
      (0, _createLinkInHead.default)(href, attributes);
    } else if (document.adoptedStyleSheets) {
      const stylesheet = new CSSStyleSheet();
      stylesheet.replaceSync(content);
      stylesheet._ui5StyleId = getStyleId(name, value); // set an id so that we can find the style later

      document.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesheet];
    } else {
      const attributes = {};
      attributes[name] = value;
      (0, _createStyleInHead.default)(content, attributes);
    }
  };

  _exports.createStyle = createStyle;

  const updateStyle = (data, name, value = "") => {
    const content = typeof data === "string" ? data : data.content;

    if ((0, _CSP.shouldUseLinks)()) {
      document.querySelector(`head>link[${name}="${value}"]`).href = (0, _CSP.getUrl)(data.packageName, data.fileName);
    } else if (document.adoptedStyleSheets) {
      document.adoptedStyleSheets.find(sh => sh._ui5StyleId === getStyleId(name, value)).replaceSync(content || "");
    } else {
      document.querySelector(`head>style[${name}="${value}"]`).textContent = content || "";
    }
  };

  _exports.updateStyle = updateStyle;

  const hasStyle = (name, value = "") => {
    if ((0, _CSP.shouldUseLinks)()) {
      return !!document.querySelector(`head>link[${name}="${value}"]`);
    }

    if (document.adoptedStyleSheets) {
      return !!document.adoptedStyleSheets.find(sh => sh._ui5StyleId === getStyleId(name, value));
    }

    return !!document.querySelector(`head>style[${name}="${value}"]`);
  };

  _exports.hasStyle = hasStyle;

  const removeStyle = (name, value = "") => {
    if ((0, _CSP.shouldUseLinks)()) {
      const linkElement = document.querySelector(`head>link[${name}="${value}"]`);

      if (linkElement) {
        linkElement.parentElement.removeChild(linkElement);
      }
    } else if (document.adoptedStyleSheets) {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(sh => sh._ui5StyleId !== getStyleId(name, value));
    } else {
      const styleElement = document.querySelector(`head > style[${name}="${value}"]`);

      if (styleElement) {
        styleElement.parentElement.removeChild(styleElement);
      }
    }
  };

  _exports.removeStyle = removeStyle;

  const createOrUpdateStyle = (data, name, value = "") => {
    if (hasStyle(name, value)) {
      updateStyle(data, name, value);
    } else {
      createStyle(data, name, value);
    }
  };

  _exports.createOrUpdateStyle = createOrUpdateStyle;
});