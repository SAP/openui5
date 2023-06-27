sap.ui.define(["exports", "./escapeRegex", "sap/base/security/encodeXML"], function (_exports, _escapeRegex, _encodeXML) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _escapeRegex = _interopRequireDefault(_escapeRegex);
  _encodeXML = _interopRequireDefault(_encodeXML);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // @ts-ignore

  // utility to replace all occurances of a string
  function replaceAll(text, find, replace, caseInsensitive) {
    return text.replaceAll(new RegExp((0, _escapeRegex.default)(find), `${caseInsensitive ? "i" : ""}g`), replace);
  }
  /**
   * Generate markup for a raw string where a particular text is wrapped with some tag, by default `<b>` (bold) tag.
   * All inputs to this function are considered literal text, and special characters will always be escaped.
   * @param {string} text The text to add highlighting to
   * @param {string} textToHighlight The text which should be highlighted
   * @return {string} the markup HTML which contains all occurrances of the input text surrounded with a `<b>` tag.
   */
  function generateHighlightedMarkup(text, textToHighlight) {
    if (!text || !textToHighlight) {
      return text;
    }
    // a token is some string that does not appear in either of the input strings
    // repeat the token until it does not appear in the string
    const makeToken = t => {
      const [s, e] = t.split("");
      while (text.indexOf(t) >= 0 || textToHighlight.indexOf(t) >= 0) {
        t = `${s}${t}${e}`;
      }
      return t;
    };
    // It doesn't matter what characters are used as long as all 4 of them are unique
    // And also that encodeXML will not change these characters
    const openToken = makeToken("12");
    const closeToken = makeToken("34");
    // wrap every occurance of the textToHighlight using the open/close tokens (instead of markup at this point)
    let result = (0, _encodeXML.default)(replaceAll(text, textToHighlight, match => `${openToken}${match}${closeToken}`, true));
    // now replace the open and close tokens with the markup that we expect
    [[openToken, "<b>"], [closeToken, "</b>"]].forEach(([find, replace]) => {
      result = replaceAll(result, find, replace, false);
    });
    return result;
  }
  var _default = generateHighlightedMarkup;
  _exports.default = _default;
});