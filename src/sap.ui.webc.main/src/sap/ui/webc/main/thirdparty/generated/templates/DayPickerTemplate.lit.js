sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="ui5-dp-root" style="${(0, _LitRenderer.styleMap)(this.styles.wrapper)}" @keydown=${this._onkeydown} @keyup=${this._onkeyup} @click=${this._onclick} @mouseover=${this._onmouseover} @focusin=${this._onfocusin} @focusout=${this._onfocusout}><div id="${(0, _LitRenderer.ifDefined)(this._id)}-content" class="ui5-dp-content" role="grid" aria-roledescription="${(0, _LitRenderer.ifDefined)(this.ariaRoledescription)}"><div role="row" class="ui5-dp-days-names-container">${(0, _LitRenderer.repeat)(this._dayNames, (item, index) => item._id || index, (item, index) => block1.call(this, context, tags, suffix, item, index))}</div>${(0, _LitRenderer.repeat)(this._weeks, (item, index) => item._id || index, (item, index) => block2.call(this, context, tags, suffix, item, index))}</div></div>`;
  }
  function block1(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div role="columnheader" aria-label="${(0, _LitRenderer.ifDefined)(item.name)}" class="${(0, _LitRenderer.ifDefined)(item.classes)}">${(0, _LitRenderer.ifDefined)(item.ultraShortName)}</div>`;
  }
  function block2(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${item.length ? block3.call(this, context, tags, suffix, item, index) : block9.call(this, context, tags, suffix, item, index)}`;
  }
  function block3(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div class="ui5-dp-weeks-row" role="row">${(0, _LitRenderer.repeat)(item, (item, index) => item._id || index, (item, index) => block4.call(this, context, tags, suffix, item, index))}</div>`;
  }
  function block4(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${item.timestamp ? block5.call(this, context, tags, suffix, item, index) : block7.call(this, context, tags, suffix, item, index)}`;
  }
  function block5(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div tabindex="${(0, _LitRenderer.ifDefined)(item._tabIndex)}" ?data-sap-focus-ref="${item.focusRef}" data-sap-timestamp="${(0, _LitRenderer.ifDefined)(item.timestamp)}" role="gridcell" aria-selected="${(0, _LitRenderer.ifDefined)(item.ariaSelected)}" aria-label="${(0, _LitRenderer.ifDefined)(item.ariaLabel)}" aria-disabled="${(0, _LitRenderer.ifDefined)(item.ariaDisabled)}" class="${(0, _LitRenderer.ifDefined)(item.classes)}"><span class="ui5-dp-daytext" data-sap-timestamp="${(0, _LitRenderer.ifDefined)(item.timestamp)}">${(0, _LitRenderer.ifDefined)(item.day)}</span>${item._isSecondaryCalendarType ? block6.call(this, context, tags, suffix, item, index) : undefined}</div>`;
  }
  function block6(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<span class="ui5-dp-daytext ui5-dp-daysectext">${(0, _LitRenderer.ifDefined)(item.secondDay)}</span>`;
  }
  function block7(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`${!item.isHidden ? block8.call(this, context, tags, suffix, item, index) : undefined}`;
  }
  function block8(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div class="ui5-dp-weekname-container" role="rowheader" aria-label="Calendar Week ${(0, _LitRenderer.ifDefined)(item.weekNum)}"><span class="ui5-dp-weekname">${(0, _LitRenderer.ifDefined)(item.weekNum)}</span></div>`;
  }
  function block9(context, tags, suffix, item, index) {
    return (0, _LitRenderer.html)`<div class="sapWCEmptyWeek"></div>`;
  }
  var _default = block0;
  _exports.default = _default;
});