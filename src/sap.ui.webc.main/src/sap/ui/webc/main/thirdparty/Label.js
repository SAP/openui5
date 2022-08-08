sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/util/findNodeOwner", "sap/ui/webc/common/thirdparty/base/Device", "./types/WrappingType", "./generated/templates/LabelTemplate.lit", "./generated/themes/Label.css"], function (_exports, _UI5Element, _LitRenderer, _findNodeOwner, _Device, _WrappingType, _LabelTemplate, _Label) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _findNodeOwner = _interopRequireDefault(_findNodeOwner);
  _WrappingType = _interopRequireDefault(_WrappingType);
  _LabelTemplate = _interopRequireDefault(_LabelTemplate);
  _Label = _interopRequireDefault(_Label);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-label",
    properties:
    /** @lends sap.ui.webcomponents.main.Label.prototype */
    {
      /**
       * Defines whether an asterisk character is added to the component text.
       * <br><br>
       * <b>Note:</b> Usually indicates that user input is required.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      required: {
        type: Boolean
      },

      /**
       * Defines how the text of a component will be displayed when there is not enough space.
       * Available options are:
       * <ul>
       * <li><code>None</code> - The text will be truncated with an ellipsis.</li>
       * <li><code>Normal</code> - The text will wrap. The words will not be broken based on hyphenation.</li>
       * </ul>
       *
       * @type {WrappingType}
       * @defaultvalue "None"
       * @public
       */
      wrappingType: {
        type: _WrappingType.default,
        defaultValue: _WrappingType.default.None
      },

      /**
       * Defines whether colon is added to the component text.
       * <br><br>
       * <b>Note:</b> Usually used in forms.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      showColon: {
        type: Boolean
      },

      /**
       * Defines the labeled input by providing its ID.
       * <br><br>
       * <b>Note:</b> Can be used with both <code>ui5-input</code> and native input.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      "for": {
        type: String
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.Label.prototype */
    {
      /**
       * Defines the text of the component.
       * <br><b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
       *
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-label</code> is a component used to represent a label,
   * providing valuable information to the user.
   * Usually it is placed next to a value holder, such as a text field.
   * It informs the user about what data is displayed or expected in the value holder.
   * <br><br>
   * The <code>ui5-label</code> appearance can be influenced by properties,
   * such as <code>required</code> and <code>wrappingType</code>.
   * The appearance of the Label can be configured in a limited way by using the design property.
   * For a broader choice of designs, you can use custom styles.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Label";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Label
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-label
   * @public
   */

  class Label extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _LabelTemplate.default;
    }

    static get styles() {
      return _Label.default;
    }

    get classes() {
      return {
        textWrapper: {
          "ui5-label-text-wrapper": true,
          "ui5-label-text-wrapper-safari": (0, _Device.isSafari)()
        }
      };
    }

    _onclick() {
      if (!this.for) {
        return;
      }

      const ownerNode = (0, _findNodeOwner.default)(this);
      const elementToFocus = ownerNode.querySelector(`#${this.for}`);

      if (elementToFocus) {
        elementToFocus.focus();
      }
    }

  }

  Label.define();
  var _default = Label;
  _exports.default = _default;
});