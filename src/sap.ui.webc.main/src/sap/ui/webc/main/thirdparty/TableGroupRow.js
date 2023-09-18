sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./CheckBox", "./generated/templates/TableGroupRowTemplate.lit", "./types/TableMode", "./generated/i18n/i18n-defaults", "./generated/themes/TableGroupRow.css"], function (_exports, _UI5Element, _customElement, _property, _event, _LitRenderer, _i18nBundle, _CheckBox, _TableGroupRowTemplate, _TableMode, _i18nDefaults, _TableGroupRow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _CheckBox = _interopRequireDefault(_CheckBox);
  _TableGroupRowTemplate = _interopRequireDefault(_TableGroupRowTemplate);
  _TableMode = _interopRequireDefault(_TableMode);
  _TableGroupRow = _interopRequireDefault(_TableGroupRow);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var TableGroupRow_1;

  // Texts

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-table-group-row</code> component represents a group row in the <code>ui5-table</code>.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-table-group-row</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>group-row - Used to style the native <code>tr</code> element.</li>
   * </ul>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TableGroupRow
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-table-group-row
   * @since 1.0.0-rc.15
   * @implements sap.ui.webc.main.ITableRow
   * @public
   */
  let TableGroupRow = TableGroupRow_1 = class TableGroupRow extends _UI5Element.default {
    constructor() {
      super(...arguments);
      // Properties, set and handled by the Table
      this.selected = false;
      this._tabbables = [];
      this._columnsInfoString = "";
    }
    get colSpan() {
      return this._colSpan;
    }
    get ariaLabelText() {
      return `${TableGroupRow_1.i18nBundle.getText(_i18nDefaults.TABLE_GROUP_ROW_ARIA_LABEL)} ${this.innerText}. ${this._ariaPosition}`;
    }
    visibleColCount() {
      let count = this._columnsInfo.reduce((acc, column) => {
        return column.visible ? ++acc : acc;
      }, 0);
      if (this.mode === _TableMode.default.MultiSelect) {
        count++;
      }
      return count;
    }
    onBeforeRendering() {
      if (!this._columnsInfo || this._columnsInfo.length === 0) {
        return;
      }
      this._colSpan = this.visibleColCount();
    }
    _onfocusin(e) {
      this.fireEvent("_focused", e);
    }
    static async onDefine() {
      TableGroupRow_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)({
    type: _TableMode.default,
    defaultValue: _TableMode.default.None
  })], TableGroupRow.prototype, "mode", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], TableGroupRow.prototype, "_columnsInfo", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "-1"
  })], TableGroupRow.prototype, "_tabIndex", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TableGroupRow.prototype, "_busy", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "",
    noAttribute: true
  })], TableGroupRow.prototype, "_ariaPosition", void 0);
  TableGroupRow = TableGroupRow_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-table-group-row",
    styles: _TableGroupRow.default,
    renderer: _LitRenderer.default,
    template: _TableGroupRowTemplate.default,
    dependencies: [_CheckBox.default]
  }), (0, _event.default)("_focused")], TableGroupRow);
  TableGroupRow.define();
  var _default = TableGroupRow;
  _exports.default = _default;
});