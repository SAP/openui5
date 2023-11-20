sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-media-gallery-root"><div class="ui5-media-gallery-display-wrapper"><div class="ui5-media-gallery-display" @click="${this._onDisplayAreaClick}">${this._isPhonePlatform ? block1.call(this, context, tags, suffix) : block3.call(this, context, tags, suffix)}</div></div>${this._showThumbnails ? block4.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-carousel", tags, suffix)} @ui5-navigate="${(0, _LitRenderer.ifDefined)(this._onCarouselNavigate)}" hide-navigation-arrows>${(0, _LitRenderer.repeat)(this._selectableItems, (item, index) => item._id || index, (item, index) => block2.call(this, context, tags, suffix, item, index))}</${(0, _LitRenderer.scopeTag)("ui5-carousel", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-carousel @ui5-navigate="${(0, _LitRenderer.ifDefined)(this._onCarouselNavigate)}" hide-navigation-arrows>${(0, _LitRenderer.repeat)(this._selectableItems, (item, index) => item._id || index, (item, index) => block2.call(this, context, tags, suffix, item, index))}</ui5-carousel>`;
  }
  function block2(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-media-gallery-item", tags, suffix)} ?_interactive="${(0, _LitRenderer.ifDefined)(this.interactiveDisplayArea)}" ?_square="${(0, _LitRenderer.ifDefined)(this._shouldHaveSquareDisplay)}" _tab-index="${(0, _LitRenderer.ifDefined)(this._mainItemTabIndex)}"></${(0, _LitRenderer.scopeTag)("ui5-media-gallery-item", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-media-gallery-item ?_interactive="${(0, _LitRenderer.ifDefined)(this.interactiveDisplayArea)}" ?_square="${(0, _LitRenderer.ifDefined)(this._shouldHaveSquareDisplay)}" _tab-index="${(0, _LitRenderer.ifDefined)(this._mainItemTabIndex)}"></ui5-media-gallery-item>`;
  }
  function block4(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-media-gallery-thumbnails-wrapper"><ul>${(0, _LitRenderer.repeat)(this._visibleItems, (item, index) => item._id || index, (item, index) => block5.call(this, context, tags, suffix, item, index))}${this._showOverflowBtn ? block6.call(this, context, tags, suffix) : undefined}</ul></div>`;
  }
  function block5(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<li id="${(0, _LitRenderer.ifDefined)(item.id)}" class="ui5-media-gallery-thumbnail" role="option" @click="${this._onThumbnailClick}" @ui5-click="${(0, _LitRenderer.ifDefined)(this._onThumbnailClick)}"><slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot></li>`;
  }
  function block6(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<li class="ui5-media-gallery-overflow"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} @click="${this._onOverflowBtnClick}">+${(0, _LitRenderer.ifDefined)(this._overflowSize)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></li>` : (0, _LitRenderer.html)`<li class="ui5-media-gallery-overflow"><ui5-button @click="${this._onOverflowBtnClick}">+${(0, _LitRenderer.ifDefined)(this._overflowSize)}</ui5-button></li>`;
  }
  var _default = block0;
  _exports.default = _default;
});