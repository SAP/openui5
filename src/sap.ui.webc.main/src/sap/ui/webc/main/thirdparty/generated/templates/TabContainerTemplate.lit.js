sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /* eslint no-unused-vars: 0 */
  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(context.classes.root)}">${context.tabsAtTheBottom ? block1(context, tags, suffix) : undefined}<div class="${(0, _LitRenderer.classMap)(context.classes.header)}" id="${(0, _LitRenderer.ifDefined)(context._id)}-header"><div class="ui5-tc__overflow ui5-tc__overflow--start" @click="${context._onOverflowClick}" @keydown="${context._onOverflowKeyDown}" hidden>${context.startOverflowButton.length ? block3(context, tags, suffix) : block4(context, tags, suffix)}</div><div id="${(0, _LitRenderer.ifDefined)(context._id)}-tabStrip" class="${(0, _LitRenderer.classMap)(context.classes.tabStrip)}" role="tablist" @click="${context._onTabStripClick}" @keydown="${context._onTabStripKeyDown}" @keyup="${context._onTabStripKeyUp}">${(0, _LitRenderer.repeat)(context.items, (item, index) => item._id || index, (item, index) => block5(item, index, context, tags, suffix))}</div><div class="ui5-tc__overflow ui5-tc__overflow--end" @click="${context._onOverflowClick}" @keydown="${context._onOverflowKeyDown}" hidden>${context.overflowButton.length ? block6(context, tags, suffix) : block7(context, tags, suffix)}</div></div>${!context.tabsAtTheBottom ? block8(context, tags, suffix) : undefined}</div> `;

  const block1 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(context.classes.content)}" part="content"><div class="ui5-tc__contentItem" id="ui5-tc-content" ?hidden="${context._selectedTab.effectiveHidden}" role="tabpanel" aria-labelledby="${(0, _LitRenderer.ifDefined)(context._selectedTab._id)}">${(0, _LitRenderer.repeat)(context.items, (item, index) => item._id || index, (item, index) => block2(item, index, context, tags, suffix))}</div></div>`;

  const block2 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._effectiveSlotName)}"></slot>`;

  const block3 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="startOverflowButton"></slot>`;

  const block4 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="${(0, _LitRenderer.ifDefined)(context.overflowMenuIcon)}" data-ui5-stable="overflow-start" tabindex="-1" tooltip="${(0, _LitRenderer.ifDefined)(context.overflowMenuTitle)}" aria-haspopup="true" icon-end>${(0, _LitRenderer.ifDefined)(context._startOverflowText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="${(0, _LitRenderer.ifDefined)(context.overflowMenuIcon)}" data-ui5-stable="overflow-start" tabindex="-1" tooltip="${(0, _LitRenderer.ifDefined)(context.overflowMenuTitle)}" aria-haspopup="true" icon-end>${(0, _LitRenderer.ifDefined)(context._startOverflowText)}</ui5-button>`;

  const block5 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.ifDefined)(item.stripPresentation)}`;

  const block6 = (context, tags, suffix) => (0, _LitRenderer.html)`<slot name="overflowButton"></slot>`;

  const block7 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)} icon="${(0, _LitRenderer.ifDefined)(context.overflowMenuIcon)}" data-ui5-stable="overflow-end" tabindex="-1" tooltip="${(0, _LitRenderer.ifDefined)(context.overflowMenuTitle)}" aria-haspopup="true" icon-end>${(0, _LitRenderer.ifDefined)(context._endOverflowText)}</${(0, _LitRenderer.scopeTag)("ui5-button", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-button icon="${(0, _LitRenderer.ifDefined)(context.overflowMenuIcon)}" data-ui5-stable="overflow-end" tabindex="-1" tooltip="${(0, _LitRenderer.ifDefined)(context.overflowMenuTitle)}" aria-haspopup="true" icon-end>${(0, _LitRenderer.ifDefined)(context._endOverflowText)}</ui5-button>`;

  const block8 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(context.classes.content)}" part="content"><div class="ui5-tc__contentItem" id="ui5-tc-content" ?hidden="${context._selectedTab.effectiveHidden}" role="tabpanel" aria-labelledby="${(0, _LitRenderer.ifDefined)(context._selectedTab._id)}">${(0, _LitRenderer.repeat)(context.items, (item, index) => item._id || index, (item, index) => block9(item, index, context, tags, suffix))}</div></div>`;

  const block9 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._effectiveSlotName)}"></slot>`;

  var _default = block0;
  _exports.default = _default;
});