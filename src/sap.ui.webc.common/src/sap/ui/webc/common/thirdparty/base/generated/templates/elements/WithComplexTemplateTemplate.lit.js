sap.ui.define(["exports", "../../../renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div>Root text: ${(0, _LitRenderer.ifDefined)(this.text)}${(0, _LitRenderer.repeat)(this.items, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))} Root text: ${(0, _LitRenderer.ifDefined)(this.text)}</div>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<h3>Item-${index}</h3>${item.text ? block2.call(this, context, tags, suffix, item, index) : undefined}<ul>${(0, _LitRenderer.repeat)(item.words, (item, index) => item._id || index, (item, index) => block3.call(this, context, tags, suffix, item, index))}</ul>${item.text ? block4.call(this, context, tags, suffix, item, index) : undefined}`;
  }
  function block2(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div class="before-each-content--start--${index}">Root text: ${(0, _LitRenderer.ifDefined)(this.text)}, Item text: ${(0, _LitRenderer.ifDefined)(item.text)}</div>`;
  }
  function block3(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<li><h3>Word-${index}</h3><div class="nested-each-content--${index}--0">Root Text: ${(0, _LitRenderer.ifDefined)(this.text)}, Word text: ${(0, _LitRenderer.ifDefined)(item.text)}</div><div class="nested-each-content--${index}--1">Root Text: ${(0, _LitRenderer.ifDefined)(this.text)}, Word text: ${(0, _LitRenderer.ifDefined)(item.text)}</div></li>`;
  }
  function block4(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div class="after-each-content--end--${index}">Root text: ${(0, _LitRenderer.ifDefined)(this.text)}, Item text: ${(0, _LitRenderer.ifDefined)(item.text)}</div>`;
  }
  var _default = block0;
  _exports.default = _default;
});