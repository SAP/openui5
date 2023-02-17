sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  const block0 = (context, tags, suffix) => (0, _LitRenderer.html)`<tr class="ui5-table-row-root" tabindex="${(0, _LitRenderer.ifDefined)(context._tabIndex)}" @focusin="${context._onfocusin}" @focusout="${context._onfocusout}" @click="${context._onrowclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @mouseup="${context._onmouseup}" @touchstart="${context._ontouchstart}" @touchend="${context._ontouchend}" aria-label="${(0, _LitRenderer.ifDefined)(context.ariaLabelText)}" aria-selected="${(0, _LitRenderer.ifDefined)(context.selected)}" data-sap-focus-ref part="row" role="row">${context.isMultiSelect ? block1(context, tags, suffix) : undefined}${context.shouldPopin ? block2(context, tags, suffix) : block4(context, tags, suffix)}</tr>${context.shouldPopin ? block6(context, tags, suffix) : undefined} `;
  const block1 = (context, tags, suffix) => suffix ? (0, _LitRenderer.html)`<td class="ui5-table-multi-select-cell" aria-hidden="true" role="presentation"><${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)} class="ui5-multi-select-checkbox" ?checked="${context.selected}" aria-label="${(0, _LitRenderer.ifDefined)(context.ariaLabelRowSelection)}" @ui5-change="${(0, _LitRenderer.ifDefined)(context._handleSelection)}" tabindex="-1"></${(0, _LitRenderer.scopeTag)("ui5-checkbox", tags, suffix)}></td>` : (0, _LitRenderer.html)`<td class="ui5-table-multi-select-cell" aria-hidden="true" role="presentation"><ui5-checkbox class="ui5-multi-select-checkbox" ?checked="${context.selected}" aria-label="${(0, _LitRenderer.ifDefined)(context.ariaLabelRowSelection)}" @ui5-change="${(0, _LitRenderer.ifDefined)(context._handleSelection)}" tabindex="-1"></ui5-checkbox></td>`;
  const block2 = (context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(context.visibleCells, (item, index) => item._id || index, (item, index) => block3(item, index, context, tags, suffix))}`;
  const block3 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;
  const block4 = (context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(context.cells, (item, index) => item._id || index, (item, index) => block5(item, index, context, tags, suffix))}`;
  const block5 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<slot name="${(0, _LitRenderer.ifDefined)(item._individualSlot)}"></slot>`;
  const block6 = (context, tags, suffix) => (0, _LitRenderer.html)`${(0, _LitRenderer.repeat)(context.popinCells, (item, index) => item._id || index, (item, index) => block7(item, index, context, tags, suffix))}`;
  const block7 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<tr part="popin-row" role="row" class="${(0, _LitRenderer.ifDefined)(item.classes)}" @click="${context._onrowclick}" @keydown="${context._onkeydown}" @keyup="${context._onkeyup}"><td colspan="${(0, _LitRenderer.ifDefined)(context.visibleCellsCount)}" role="cell">${item.popinText ? block8(item, index, context, tags, suffix) : undefined}<div><slot name="${(0, _LitRenderer.ifDefined)(item.cell._individualSlot)}"></slot></div></td></tr>`;
  const block8 = (item, index, context, tags, suffix) => (0, _LitRenderer.html)`<span class="ui5-table-row-popin-title">${(0, _LitRenderer.ifDefined)(item.popinText)}:</span>`;
  var _default = block0;
  _exports.default = _default;
});