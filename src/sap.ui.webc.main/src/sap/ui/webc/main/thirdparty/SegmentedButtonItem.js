sap.ui.define(["exports", "./generated/templates/SegmentedButtonItemTemplate.lit", "./ToggleButton", "./types/ButtonDesign", "./Icon", "./generated/i18n/i18n-defaults"], function (_exports, _SegmentedButtonItemTemplate, _ToggleButton, _ButtonDesign, _Icon, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _SegmentedButtonItemTemplate = _interopRequireDefault(_SegmentedButtonItemTemplate);
  _ToggleButton = _interopRequireDefault(_ToggleButton);
  _ButtonDesign = _interopRequireDefault(_ButtonDesign);
  _Icon = _interopRequireDefault(_Icon);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @public
   */
  const metadata = {
    tag: "ui5-segmented-button-item",
    properties: /** @lends sap.ui.webcomponents.main.SegmentedButtonItem.prototype */{
      /**
       * <b>Note:</b> The property is inherited and not supported. If set, it won't take any effect.
       *
       * @type {ButtonDesign}
       * @defaultvalue "Default"
       * @public
       */
      design: {
        type: _ButtonDesign.default,
        defaultValue: _ButtonDesign.default.Default
      },
      /**
       * <b>Note:</b> The property is inherited and not supported. If set, it won't take any effect.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      iconEnd: {
        type: Boolean
      },
      /**
       * <b>Note:</b> The property is inherited and not supported. If set, it won't take any effect.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      submits: {
        type: Boolean
      },
      /**
       * Defines the index of the item inside of the SegmentedButton.
       *
       * @private
       * @type {string}
       */
      posInSet: {
        type: String
      },
      /**
       * Defines how many items are inside of the SegmentedButton.
       *
       * @private
       * @type {string}
       */
      sizeOfSet: {
        type: String
      }
    }
  };

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * Users can use the <code>ui5-segmented-button-item</code> as part of a <code>ui5-segmented-button</code>.
   * <br><br>
   * Clicking or tapping on a <code>ui5-segmented-button-item</code> changes its state to <code>pressed</code>.
   * The item returns to its initial state when the user clicks or taps on it again.
   * By applying additional custom CSS-styling classes, apps can give a different style to any
   * <code>ui5-segmented-button-item</code>.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/SegmentedButtonItem";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.SegmentedButtonItem
   * @extends ToggleButton
   * @tagname ui5-segmented-button-item
   * @implements sap.ui.webcomponents.main.ISegmentedButtonItem
   * @public
   */
  class SegmentedButtonItem extends _ToggleButton.default {
    static get metadata() {
      return metadata;
    }
    static get template() {
      return _SegmentedButtonItemTemplate.default;
    }
    static get dependencies() {
      return [_Icon.default];
    }
    get ariaDescription() {
      return SegmentedButtonItem.i18nBundle.getText(_i18nDefaults.SEGMENTEDBUTTONITEM_ARIA_DESCRIPTION);
    }
  }
  SegmentedButtonItem.define();
  var _default = SegmentedButtonItem;
  _exports.default = _default;
});