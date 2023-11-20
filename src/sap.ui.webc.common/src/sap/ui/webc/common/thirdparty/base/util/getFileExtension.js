sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * ""                        -> ""
   * "noExtension"             -> ""
   * "file.txt"                -> ".txt"
   * "file.with.many.dots.doc" -> ".doc"
   * ".gitignore"              -> ""
   *
   * @param { string } fileName - the file name
   * @returns { string }
   */
  const getFileExtension = fileName => {
    const dotPos = fileName.lastIndexOf(".");
    if (dotPos < 1) {
      return "";
    }
    return fileName.slice(dotPos);
  };
  var _default = getFileExtension;
  _exports.default = _default;
});