sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}" ondragstart="return false;" ondrop="return false;" aria-hidden="true" class="${(0, _LitRenderer.classMap)(this.classes.clock)}"><div data-label="${(0, _LitRenderer.ifDefined)(this.label)}" class="ui5-tp-clock-dial"></div><div>${(0, _LitRenderer.repeat)(this._items, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}${this._selectedItem.showMarker ? block6.call(this, context, tags, suffix) : undefined}</div><div class="ui5-tp-clock-cover" @touchstart="${this._onTouchStart}" @touchmove="${this._onTouchMove}" @touchend="${this._onTouchEnd}" @mousedown="${this._onTouchStart}" @mousemove="${this._onTouchMove}" @mouseup="${this._onTouchEnd}" @mouseout="${this._onMouseOut}" @mousewheel="${this._onMouseWheel}" @DOMMouseScroll="${this._onMouseWheel}"></div></div>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div class="ui5-tp-clock-item" style="${(0, _LitRenderer.styleMap)(item.outerStyles)}">${item.item ? block2.call(this, context, tags, suffix, item, index) : block4.call(this, context, tags, suffix, item, index)}</div>`;
  }
  function block2(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<span class="ui5-tp-clock-dot"></span><span id="${(0, _LitRenderer.ifDefined)(this._id)}-${(0, _LitRenderer.ifDefined)(item.item)}" class="ui5-tp-clock-number" style="${(0, _LitRenderer.styleMap)(item.innerStyles)}">${(0, _LitRenderer.ifDefined)(item.item)}</span>${item.innerItem ? block3.call(this, context, tags, suffix, item, index) : undefined}`;
  }
  function block3(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-${(0, _LitRenderer.ifDefined)(item.innerItem)}" class="ui5-tp-clock-number" style="${(0, _LitRenderer.styleMap)(item.innerStyles)}">${(0, _LitRenderer.ifDefined)(item.innerItem)}</span>`;
  }
  function block4(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${!this.hideFractions ? block5.call(this, context, tags, suffix, item, index) : undefined}`;
  }
  function block5(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<span class="ui5-tp-clock-mid-dot"></span>`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-tp-clock-item" style="${(0, _LitRenderer.styleMap)(this._selectedItem.outerStyles)}" marker><div class="ui5-tp-clock-marker"></div><div class="${(0, _LitRenderer.ifDefined)(this._selectedItem.itemClasses)}" style="${(0, _LitRenderer.styleMap)(this._selectedItem.innerStyles)}">${(0, _LitRenderer.ifDefined)(this._selectedItem.item)}</div><div id="${(0, _LitRenderer.ifDefined)(this._id)}-selected" class="${(0, _LitRenderer.ifDefined)(this._selectedItem.innerItemClasses)}" style="${(0, _LitRenderer.styleMap)(this._selectedItem.innerStyles)}">${(0, _LitRenderer.ifDefined)(this._selectedItem.innerItem)}</div></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});