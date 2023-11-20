sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<section class="ui5-carousel-root ui5-carousel-background-${(0, _LitRenderer.ifDefined)(this._backgroundDesign)}" tabindex="0" role="listbox" aria-activedescendant="${(0, _LitRenderer.ifDefined)(this.ariaActiveDescendant)}" @focusin="${this._onfocusin}" @keydown=${this._onkeydown} @mouseout="${this._onmouseout}" @mouseover="${this._onmouseover}"><div class="${(0, _LitRenderer.classMap)(this.classes.viewport)}" part="content"><div class="${(0, _LitRenderer.classMap)(this.classes.content)}" style="${(0, _LitRenderer.styleMap)(this.styles.content)}">${(0, _LitRenderer.repeat)(this.items, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</div>${this.showArrows.content ? block2.call(this, context, tags, suffix) : undefined}</div>${this.renderNavigation ? block3.call(this, context, tags, suffix) : undefined}</div></section> `;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div id="${(0, _LitRenderer.ifDefined)(item.id)}" class="ui5-carousel-item ${(0, _LitRenderer.ifDefined)(item.classes)}" style="${(0, _LitRenderer.styleMap)(item.styles)}" role="option" aria-posinset="${(0, _LitRenderer.ifDefined)(item.posinset)}" aria-setsize="${(0, _LitRenderer.ifDefined)(item.setsize)}" part="item"><slot name="${(0, _LitRenderer.ifDefined)(item.item._individualSlot)}" tabindex="${(0, _LitRenderer.ifDefined)(item.tabIndex)}"></slot></div>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<div class="ui5-carousel-navigation-arrows"><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} arrow-back tooltip="${(0, _LitRenderer.ifDefined)(this.previousPageText)}" class="ui5-carousel-navigation-button ${(0, _LitRenderer.classMap)(this.classes.navPrevButton)}" icon="slim-arrow-left" tabindex="-1" @click=${this._navButtonClick}></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}><${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} arrow-forward tooltip="${(0, _LitRenderer.ifDefined)(this.nextPageText)}" class="ui5-carousel-navigation-button ${(0, _LitRenderer.classMap)(this.classes.navNextButton)}" icon="slim-arrow-right" tabindex="-1" @click=${this._navButtonClick}></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}></div>` : (0, _LitRenderer.html)`<div class="ui5-carousel-navigation-arrows"><ui5-button arrow-back tooltip="${(0, _LitRenderer.ifDefined)(this.previousPageText)}" class="ui5-carousel-navigation-button ${(0, _LitRenderer.classMap)(this.classes.navPrevButton)}" icon="slim-arrow-left" tabindex="-1" @click=${this._navButtonClick}></ui5-button><ui5-button arrow-forward tooltip="${(0, _LitRenderer.ifDefined)(this.nextPageText)}" class="ui5-carousel-navigation-button ${(0, _LitRenderer.classMap)(this.classes.navNextButton)}" icon="slim-arrow-right" tabindex="-1" @click=${this._navButtonClick}></ui5-button></div>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.navigation)}">${this.showArrows.navigation ? block4.call(this, context, tags, suffix) : undefined}<div class="ui5-carousel-navigation">${!this.hidePageIndicator ? block5.call(this, context, tags, suffix) : undefined}</div>${this.showArrows.navigation ? block9.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block4(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} arrow-back tooltip="${(0, _LitRenderer.ifDefined)(this.previousPageText)}" class="ui5-carousel-navigation-button ${(0, _LitRenderer.classMap)(this.classes.navPrevButton)}" icon="slim-arrow-left" tabindex="-1" @click=${this._navButtonClick}></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button arrow-back tooltip="${(0, _LitRenderer.ifDefined)(this.previousPageText)}" class="ui5-carousel-navigation-button ${(0, _LitRenderer.classMap)(this.classes.navPrevButton)}" icon="slim-arrow-left" tabindex="-1" @click=${this._navButtonClick}></ui5-button>`;
  }
  function block5(context, tags, suffix) {
    return (0, _LitRenderer.html)`${this.isPageTypeDots ? block6.call(this, context, tags, suffix) : block8.call(this, context, tags, suffix)}`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(this.dots, (item, index) => item._id || index, (item, index) => block7.call(this, context, tags, suffix, item, index))}`;
  }
  function block7(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div role="img" aria-label="${(0, _LitRenderer.ifDefined)(item.ariaLabel)}" ?active="${item.active}" class="ui5-carousel-navigation-dot"></div>`;
  }
  function block8(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-carousel-navigation-text">${(0, _LitRenderer.ifDefined)(this.selectedIndexToShow)}&nbsp;${(0, _LitRenderer.ifDefined)(this.ofText)}&nbsp;${(0, _LitRenderer.ifDefined)(this.pagesCount)}</div>`;
  }
  function block9(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} arrow-forward tooltip="${(0, _LitRenderer.ifDefined)(this.nextPageText)}" class="ui5-carousel-navigation-button ${(0, _LitRenderer.classMap)(this.classes.navNextButton)}" icon="slim-arrow-right" tabindex="-1" @click=${this._navButtonClick}></${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button arrow-forward tooltip="${(0, _LitRenderer.ifDefined)(this.nextPageText)}" class="ui5-carousel-navigation-button ${(0, _LitRenderer.classMap)(this.classes.navNextButton)}" icon="slim-arrow-right" tabindex="-1" @click=${this._navButtonClick}></ui5-button>`;
  }
  var _default = block0;
  _exports.default = _default;
});