sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-slider-root ${(0, _LitRenderer.classMap)(this.classes.root)}" @mousedown="${this._onmousedown}" @touchstart="${this._ontouchstart}" @mouseover="${this._onmouseover}" @mouseout="${this._onmouseout}" @keydown="${this._onkeydown}" @keyup="${this._onkeyup}" part="root-container"><div class="ui5-slider-inner">${this.step ? block1.call(this, context, tags, suffix) : undefined}</div><span id="${(0, _LitRenderer.ifDefined)(this._id)}-accName" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.accessibleName)}</span><span id="${(0, _LitRenderer.ifDefined)(this._id)}-sliderDesc" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this._ariaLabelledByText)}</span></div> `;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.showTickmarks ? block2.call(this, context, tags, suffix) : undefined}`;
  }
  function block2(context, tags, suffix) {
    return (0, _LitRenderer.html)`<ul class="ui5-slider-tickmarks">${(0, _LitRenderer.repeat)(this.tickmarksObject, (item, index) => item._id || index, (item, index) => block3.call(this, context, tags, suffix, item, index))}</ul>${this.labelInterval ? block6.call(this, context, tags, suffix) : undefined}`;
  }
  function block3(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${item ? block4.call(this, context, tags, suffix, item, index) : block5.call(this, context, tags, suffix, item, index)}`;
  }
  function block4(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<li class="ui5-slider-tickmark ui5-slider-tickmark-in-range"></li>`;
  }
  function block5(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<li class="ui5-slider-tickmark"></li>`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`<ul class="ui5-slider-labels ${(0, _LitRenderer.classMap)(this.classes.labelContainer)}" style="${(0, _LitRenderer.styleMap)(this.styles.labelContainer)}">${(0, _LitRenderer.repeat)(this._labels, (item, index) => item._id || index, (item, index) => block7.call(this, context, tags, suffix, item, index))}</ul>`;
  }
  function block7(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<li style="${(0, _LitRenderer.styleMap)(this.styles.label)}">${(0, _LitRenderer.ifDefined)(item)}</li>`;
  }
  var _default = block0;
  _exports.default = _default;
});