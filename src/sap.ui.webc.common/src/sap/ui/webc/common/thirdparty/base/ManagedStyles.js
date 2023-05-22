sap.ui.define(["exports", "./util/createStyleInHead", "./util/createLinkInHead", "./CSP", "./Runtimes"], function (_exports, _createStyleInHead, _createLinkInHead, _CSP, _Runtimes) {
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
    let content = typeof data === "string" ? data : data.content;
    if (content.includes("[_ui5host]")) {
      content = content.replaceAll("[_ui5host]", `[_ui5rt${(0, _Runtimes.getCurrentRuntimeIndex)()}]`);
    }
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
    let content = typeof data === "string" ? data : data.content;
    if (content.includes("[_ui5host]")) {
      content = content.replaceAll("[_ui5host]", `[_ui5rt${(0, _Runtimes.getCurrentRuntimeIndex)()}]`);
    }
    if ((0, _CSP.shouldUseLinks)()) {
      const link = document.querySelector(`head>link[${name}="${value}"]`);
      link.href = (0, _CSP.getUrl)(data.packageName, data.fileName);
    } else if (document.adoptedStyleSheets) {
      const stylesheet = document.adoptedStyleSheets.find(sh => sh._ui5StyleId === getStyleId(name, value));
      if (stylesheet) {
        stylesheet.replaceSync(content || "");
      }
    } else {
      const style = document.querySelector(`head>style[${name}="${value}"]`);
      if (style) {
        style.textContent = content || "";
      }
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
      linkElement?.parentElement?.removeChild(linkElement);
    } else if (document.adoptedStyleSheets) {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(sh => sh._ui5StyleId !== getStyleId(name, value));
    } else {
      const styleElement = document.querySelector(`head > style[${name}="${value}"]`);
      styleElement?.parentElement?.removeChild(styleElement);
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