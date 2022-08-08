sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./CheckBox", "./generated/templates/TableGroupRowTemplate.lit", "./types/TableMode", "./generated/i18n/i18n-defaults", "./generated/themes/TableGroupRow.css"], function (_exports, _UI5Element, _LitRenderer, _i18nBundle, _CheckBox, _TableGroupRowTemplate, _TableMode, _i18nDefaults, _TableGroupRow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _CheckBox = _interopRequireDefault(_CheckBox);
  _TableGroupRowTemplate = _interopRequireDefault(_TableGroupRowTemplate);
  _TableMode = _interopRequireDefault(_TableMode);
  _TableGroupRow = _interopRequireDefault(_TableGroupRow);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Texts
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-table-group-row",
    slots:
    /** @lends sap.ui.webcomponents.main.TableGroupRow.prototype */
    {
      /**
       * Defines the text of the component.
       * <br>
       * <b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
       *
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node
      }
    },
    properties:
    /** @lends sap.ui.webcomponents.main.TableGroupRow.prototype */
    {
      /**
       * Defines the mode of the row
       *
       * <br><br>
       * <b>Note:</b>
       * Available options are:
       * <ul>
       * <li><code>None</code></li>
       * <li><code>SingleSelect</code></li>
       * <li><code>MultiSelect</code></li>
       * </ul>
       * @type {TableMode}
       * @defaultvalue "None"
       * @private
       */
      mode: {
        type: _TableMode.default,
        defaultValue: _TableMode.default.None
      },
      _columnsInfo: {
        type: Object,
        multiple: true
      },
      _tabIndex: {
        type: String,
        defaultValue: "-1"
      },
      _busy: {
        type: Boolean
      },
      _ariaPosition: {
        type: String,
        defaultValue: "",
        noAttribute: true
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.TableGroupRow.prototype */
    {
      _focused: {}
    }
  };
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
   * @alias sap.ui.webcomponents.main.TableGroupRow
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-table-group-row
   * @since 1.0.0-rc.15
   * @implements sap.ui.webcomponents.main.ITableRow
   * @public
   */

  class TableGroupRow extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get styles() {
      return _TableGroupRow.default;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _TableGroupRowTemplate.default;
    }

    static get dependencies() {
      return [_CheckBox.default];
    }

    constructor() {
      super();
    }

    get colSpan() {
      return this._colSpan;
    }

    get ariaLabelText() {
      return `${TableGroupRow.i18nBundle.getText(_i18nDefaults.TABLE_GROUP_ROW_ARIA_LABEL)} ${this.innerText}. ${this._ariaPosition}`;
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

    _onfocusin(event) {
      this.fireEvent("_focused", event);
    }

    static async onDefine() {
      TableGroupRow.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

  }

  TableGroupRow.define();
  var _default = TableGroupRow;
  _exports.default = _default;
});