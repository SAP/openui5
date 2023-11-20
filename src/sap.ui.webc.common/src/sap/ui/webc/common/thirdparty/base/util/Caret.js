sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setCaretPosition = _exports.getCaretPosition = void 0;
  /**
   * Returns the caret (cursor) position of the specified text field (field).
   * Return value range is 0-field.value.length.
   */
  const getCaretPosition = field => {
    // Initialize
    let caretPos = 0;
    if (field.selectionStart || field.selectionStart === 0) {
      // Firefox support
      caretPos = field.selectionDirection === "backward" ? field.selectionStart : field.selectionEnd;
    }
    return caretPos;
  };
  _exports.getCaretPosition = getCaretPosition;
  const setCaretPosition = (field, caretPos) => {
    if (field.selectionStart) {
      field.focus();
      field.setSelectionRange(caretPos, caretPos);
    } else {
      field.focus();
    }
  };
  _exports.setCaretPosition = setCaretPosition;
});