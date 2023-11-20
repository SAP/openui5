sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const warnings = new Set();
  const getThemeMetadata = () => {
    // Check if the class was already applied, most commonly to the link/style tag with the CSS Variables
    let el = document.querySelector(".sapThemeMetaData-Base-baseLib") || document.querySelector(".sapThemeMetaData-UI5-sap-ui-core");
    if (el) {
      return getComputedStyle(el).backgroundImage;
    }
    el = document.createElement("span");
    el.style.display = "none";
    // Try with sapThemeMetaData-Base-baseLib first
    el.classList.add("sapThemeMetaData-Base-baseLib");
    document.body.appendChild(el);
    let metadata = getComputedStyle(el).backgroundImage;
    // Try with sapThemeMetaData-UI5-sap-ui-core only if the previous selector was not found
    if (metadata === "none") {
      el.classList.add("sapThemeMetaData-UI5-sap-ui-core");
      metadata = getComputedStyle(el).backgroundImage;
    }
    document.body.removeChild(el);
    return metadata;
  };
  const parseThemeMetadata = metadataString => {
    const params = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(metadataString);
    if (params && params.length >= 2) {
      let paramsString = params[1];
      paramsString = paramsString.replace(/\\"/g, `"`);
      if (paramsString.charAt(0) !== "{" && paramsString.charAt(paramsString.length - 1) !== "}") {
        try {
          paramsString = decodeURIComponent(paramsString);
        } catch (ex) {
          if (!warnings.has("decode")) {
            console.warn("Malformed theme metadata string, unable to decodeURIComponent"); // eslint-disable-line
            warnings.add("decode");
          }
          return;
        }
      }
      try {
        return JSON.parse(paramsString);
      } catch (ex) {
        if (!warnings.has("parse")) {
          console.warn("Malformed theme metadata string, unable to parse JSON"); // eslint-disable-line
          warnings.add("parse");
        }
      }
    }
  };
  const processThemeMetadata = metadata => {
    let themeName;
    let baseThemeName;
    try {
      themeName = metadata.Path.match(/\.([^.]+)\.css_variables$/)[1];
      baseThemeName = metadata.Extends[0];
    } catch (ex) {
      if (!warnings.has("object")) {
        console.warn("Malformed theme metadata Object", metadata); // eslint-disable-line
        warnings.add("object");
      }
      return;
    }
    return {
      themeName,
      baseThemeName
    };
  };
  const getThemeDesignerTheme = () => {
    const metadataString = getThemeMetadata();
    if (!metadataString || metadataString === "none") {
      return;
    }
    const metadata = parseThemeMetadata(metadataString);
    if (metadata) {
      return processThemeMetadata(metadata);
    }
  };
  var _default = getThemeDesignerTheme;
  _exports.default = _default;
});