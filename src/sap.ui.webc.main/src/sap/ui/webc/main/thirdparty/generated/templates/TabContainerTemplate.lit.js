sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.root)}">${this.tabsAtTheBottom ? block1.call(this, context, tags, suffix) : undefined}<div class="${(0, _LitRenderer.classMap)(this.classes.header)}" id="${(0, _LitRenderer.ifDefined)(this._id)}-header" @focusin="${this._onHeaderFocusin}"><div class="ui5-tc__overflow ui5-tc__overflow--start" @click="${this._onOverflowClick}" @keydown="${this._onOverflowKeyDown}" hidden>${this.startOverflowButton.length ? block3.call(this, context, tags, suffix) : block4.call(this, context, tags, suffix)}</div><div id="${(0, _LitRenderer.ifDefined)(this._id)}-tabStrip" class="${(0, _LitRenderer.classMap)(this.classes.tabStrip)}" role="tablist" aria-describedby="${(0, _LitRenderer.ifDefined)(this.tablistAriaDescribedById)}" @click="${this._onTabStripClick}" @keydown="${this._onTabStripKeyDown}" @keyup="${this._onTabStripKeyUp}">${(0, _LitRenderer.repeat)(this.items, (item, index) => item._id || index, (item, index) => block5.call(this, context, tags, suffix, item, index))}</div><div class="ui5-tc__overflow ui5-tc__overflow--end" @click="${this._onOverflowClick}" @keydown="${this._onOverflowKeyDown}" hidden>${this.overflowButton.length ? block6.call(this, context, tags, suffix) : block7.call(this, context, tags, suffix)}</div></div>${!this.tabsAtTheBottom ? block8.call(this, context, tags, suffix) : undefined}${this.hasSubTabs ? block10.call(this, context, tags, suffix) : undefined}</div> `;
  }
  function block1(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.content)}" part="content"><div class="ui5-tc__contentItem" id="ui5-tc-content" ?hidden="${this._selectedTab.effectiveHidden}" role="tabpanel" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._selectedTab._id)}">${(0, _LitRenderer.repeat)(this.items, (item, index) => item._id || index, (item, index) => block2.call(this, context, tags, suffix, item, index))}</div></div>`;
  }
  function block2(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._effectiveSlotName)}"></slot>`;
  }
  function block3(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="startOverflowButton"></slot>`;
  }
  function block4(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="${(0, _LitRenderer.ifDefined)(this.overflowMenuIcon)}" data-ui5-stable="overflow-start" tabindex="-1" tooltip="${(0, _LitRenderer.ifDefined)(this.overflowMenuTitle)}" aria-haspopup="menu" icon-end>${(0, _LitRenderer.ifDefined)(this._startOverflowText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="${(0, _LitRenderer.ifDefined)(this.overflowMenuIcon)}" data-ui5-stable="overflow-start" tabindex="-1" tooltip="${(0, _LitRenderer.ifDefined)(this.overflowMenuTitle)}" aria-haspopup="menu" icon-end>${(0, _LitRenderer.ifDefined)(this._startOverflowText)}</ui5-button>`;
  }
  function block5(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item.stripPresentation)}`;
  }
  function block6(context, tags, suffix) {
    return (0, _LitRenderer.html)`<slot name="overflowButton"></slot>`;
  }
  function block7(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="${(0, _LitRenderer.ifDefined)(this.overflowMenuIcon)}" data-ui5-stable="overflow-end" tabindex="-1" tooltip="${(0, _LitRenderer.ifDefined)(this.overflowMenuTitle)}" aria-haspopup="menu" icon-end>${(0, _LitRenderer.ifDefined)(this._endOverflowText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="${(0, _LitRenderer.ifDefined)(this.overflowMenuIcon)}" data-ui5-stable="overflow-end" tabindex="-1" tooltip="${(0, _LitRenderer.ifDefined)(this.overflowMenuTitle)}" aria-haspopup="menu" icon-end>${(0, _LitRenderer.ifDefined)(this._endOverflowText)}</ui5-button>`;
  }
  function block8(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.content)}" part="content"><div class="ui5-tc__contentItem" id="ui5-tc-content" ?hidden="${this._selectedTab.effectiveHidden}" role="tabpanel" aria-labelledby="${(0, _LitRenderer.ifDefined)(this._selectedTab._id)}">${(0, _LitRenderer.repeat)(this.items, (item, index) => item._id || index, (item, index) => block9.call(this, context, tags, suffix, item, index))}</div></div>`;
  }
  function block9(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._effectiveSlotName)}"></slot>`;
  }
  function block10(context, tags, suffix) {
    return (0, _LitRenderer.html)`<span id="${(0, _LitRenderer.ifDefined)(this._id)}-invisibleText" class="ui5-hidden-text">${(0, _LitRenderer.ifDefined)(this.accInvisibleText)}</span>`;
  }
  var _default = block0;
  _exports.default = _default;
});