sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}" ?disabled= "${(0, _LitRenderer.ifDefined)(this.disabled)}" value = "${(0, _LitRenderer.ifDefined)(this.value)}" label = "${(0, _LitRenderer.ifDefined)(this.label)}" @click = ${(0, _LitRenderer.ifDefined)(this._onclick)} @keydown=${this._onkeydown} class = "${(0, _LitRenderer.classMap)(this.classes.root)}" data-sap-focus-ref tabindex="0" @wheel="${this._handleWheel}"><div class="ui5-wheelslider-header-block"><div id="${(0, _LitRenderer.ifDefined)(this._id)}--label" class="ui5-wheelslider-label">${(0, _LitRenderer.ifDefined)(this.label)}</div><div class="ui5-wheelslider-invisible-text"></div><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} class="ui5-wheelslider-arrow" icon="navigation-up-arrow" @click=${this._onArrowUp} tabindex="-1"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div><div id="${(0, _LitRenderer.ifDefined)(this._id)}--inner" class="ui5-wheelslider-inner"><div id="${(0, _LitRenderer.ifDefined)(this._id)}--selection-frame" class="ui5-wheelslider-selection-frame"></div><div id="${(0, _LitRenderer.ifDefined)(this._id)}--wrapper" class="ui5-wheelslider-wrapper">${this.expanded ? block1.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}</div></div><div class="ui5-wheelslider-footer-block"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} class="ui5-wheelslider-arrow" icon="navigation-down-arrow" @click=${this._onArrowDown} tabindex="-1"></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div></div>` : (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(this._id)}" ?disabled= "${(0, _LitRenderer.ifDefined)(this.disabled)}" value = "${(0, _LitRenderer.ifDefined)(this.value)}" label = "${(0, _LitRenderer.ifDefined)(this.label)}" @click = ${(0, _LitRenderer.ifDefined)(this._onclick)} @keydown=${this._onkeydown} class = "${(0, _LitRenderer.classMap)(this.classes.root)}" data-sap-focus-ref tabindex="0" @wheel="${this._handleWheel}"><div class="ui5-wheelslider-header-block"><div id="${(0, _LitRenderer.ifDefined)(this._id)}--label" class="ui5-wheelslider-label">${(0, _LitRenderer.ifDefined)(this.label)}</div><div class="ui5-wheelslider-invisible-text"></div><ui5-button class="ui5-wheelslider-arrow" icon="navigation-up-arrow" @click=${this._onArrowUp} tabindex="-1"></ui5-button></div><div id="${(0, _LitRenderer.ifDefined)(this._id)}--inner" class="ui5-wheelslider-inner"><div id="${(0, _LitRenderer.ifDefined)(this._id)}--selection-frame" class="ui5-wheelslider-selection-frame"></div><div id="${(0, _LitRenderer.ifDefined)(this._id)}--wrapper" class="ui5-wheelslider-wrapper">${this.expanded ? block1.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}</div></div><div class="ui5-wheelslider-footer-block"><ui5-button class="ui5-wheelslider-arrow" icon="navigation-down-arrow" @click=${this._onArrowDown} tabindex="-1"></ui5-button></div></div>`;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<ul id="${(0, _LitRenderer.ifDefined)(this._id)}--items-list" role="listbox" aria-label="${(0, _LitRenderer.ifDefined)(this.label)}">${(0, _LitRenderer.repeat)(this._itemsToShow, (item, index) => item._id || index, (item, index) => block2.call(this, context, tags, suffix, item, index))}</ul>`;
  }
  function block2(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<li class="ui5-wheelslider-item" data-item-index="${index}" role="option" aria-selected="${(0, _LitRenderer.ifDefined)(item.selected)}">${(0, _LitRenderer.ifDefined)(item.value)}</li>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<ul id="${(0, _LitRenderer.ifDefined)(this._id)}--items-list" role="listbox" aria-label="${(0, _LitRenderer.ifDefined)(this.label)}"><li class="ui5-wheelslider-item" role="option" aria-selected="true">${(0, _LitRenderer.ifDefined)(this.value)}</li></ul>`;
  }
  var _default = block0;
  _exports.default = _default;
});