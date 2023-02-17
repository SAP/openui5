sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-dp-root" style="${(0, _LitRenderer.styleMap)(context.styles.wrapper)}" @keydown=${context._onkeydown} @keyup=${context._onkeyup} @click=${context._onclick} @mouseover=${context._onmouseover} @focusin=${context._onfocusin} @focusout=${context._onfocusout}><div id="${(0, _LitRenderer.ifDefined)(context._id)}-content" class="ui5-dp-content" role="grid" aria-roledescription="${(0, _LitRenderer.ifDefined)(context.ariaRoledescription)}"><div role="row" class="ui5-dp-days-names-container">${(0, _LitRenderer.repeat)(context._dayNames, (item, index) => item._id || index, (item, index) => block1(item, index, context, tags, suffix))}</div>${(0, _LitRenderer.repeat)(context._weeks, (item, index) => item._id || index, (item, index) => block2(item, index, context, tags, suffix))}</div></div>`;
  const block1 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<div role="columnheader" aria-label="${(0, _LitRenderer.ifDefined)(item.name)}" class="${(0, _LitRenderer.ifDefined)(item.classes)}">${(0, _LitRenderer.ifDefined)(item.ultraShortName)}</div>`;
  const block2 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`${item.length ? block3(item, index, context, tags, suffix) : block9(item, index, context, tags, suffix)}`;
  const block3 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-dp-weeks-row" role="row">${(0, _LitRenderer.repeat)(item, (item, index) => item._id || index, (item, index) => block4(item, index, context, tags, suffix))}</div>`;
  const block4 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`${item.timestamp ? block5(item, index, context, tags, suffix) : block7(item, index, context, tags, suffix)}`;
  const block5 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<div tabindex="${(0, _LitRenderer.ifDefined)(item._tabIndex)}" ?data-sap-focus-ref="${item.focusRef}" data-sap-timestamp="${(0, _LitRenderer.ifDefined)(item.timestamp)}" role="gridcell" aria-selected="${(0, _LitRenderer.ifDefined)(item.ariaSelected)}" aria-label="${(0, _LitRenderer.ifDefined)(item.ariaLabel)}" aria-disabled="${(0, _LitRenderer.ifDefined)(item.ariaDisabled)}" class="${(0, _LitRenderer.ifDefined)(item.classes)}"><span class="ui5-dp-daytext" data-sap-timestamp="${(0, _LitRenderer.ifDefined)(item.timestamp)}">${(0, _LitRenderer.ifDefined)(item.day)}</span>${item._isSecondaryCalendarType ? block6(item, index, context, tags, suffix) : undefined}</div>`;
  const block6 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-dp-daytext ui5-dp-daysectext">${(0, _LitRenderer.ifDefined)(item.secondDay)}</span>`;
  const block7 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`${!item.isHidden ? block8(item, index, context, tags, suffix) : undefined}`;
  const block8 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<div class="ui5-dp-weekname-container" role="rowheader" aria-label="Calendar Week ${(0, _LitRenderer.ifDefined)(item.weekNum)}"><span class="ui5-dp-weekname">${(0, _LitRenderer.ifDefined)(item.weekNum)}</span></div>`;
  const block9 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<div class="sapWCEmptyWeek"></div>`;
  var _default = block0;
  _exports.default = _default;
});