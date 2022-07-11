sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/icons/accept", "./Icon", "./Label", "./types/WrappingType", "./generated/i18n/i18n-defaults", "./generated/templates/CheckBoxTemplate.lit", "./generated/themes/CheckBox.css"], function (_exports, _Device, _UI5Element, _LitRenderer, _i18nBundle, _ValueState, _FeaturesRegistry, _AriaLabelHelper, _Keys, _accept, _Icon, _Label, _WrappingType, _i18nDefaults, _CheckBoxTemplate, _CheckBox) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ValueState = _interopRequireDefault(_ValueState);
  _Icon = _interopRequireDefault(_Icon);
  _Label = _interopRequireDefault(_Label);
  _WrappingType = _interopRequireDefault(_WrappingType);
  _CheckBoxTemplate = _interopRequireDefault(_CheckBoxTemplate);
  _CheckBox = _interopRequireDefault(_CheckBox);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles
  let isGlobalHandlerAttached = false;
  let activeCb = null;
  /**
   * @public
   */

  const metadata = {
    tag: "ui5-checkbox",
    languageAware: true,
    properties:
    /** @lends sap.ui.webcomponents.main.CheckBox.prototype */
    {
      /**
       * Receives id(or many ids) of the elements that label the component
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.1.0
       */
      accessibleNameRef: {
        type: String,
        defaultValue: ""
      },

      /**
       * Defines the accessible aria name of the component.
       *
       * @type {string}
       * @public
       * @defaultvalue ""
       * @since 1.1.0
       */
      accessibleName: {
        type: String
      },

      /**
       * Defines whether the component is disabled.
       * <br><br>
       * <b>Note:</b> A disabled component is completely noninteractive.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },

      /**
       * Defines whether the component is read-only.
       * <br><br>
       * <b>Note:</b> A red-only component is not editable,
       * but still provides visual feedback upon user interaction.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      readonly: {
        type: Boolean
      },

      /**
       * Defines whether the component is required.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.3.0
       */
      required: {
        type: Boolean
      },

      /**
      * Defines whether the component is displayed as partially checked.
      * <br><br>
      * <b>Note:</b> The indeterminate state can be set only programatically and can’t be achieved by user
      * interaction and the resulting visual state depends on the values of the <code>indeterminate</code>
      * and <code>checked</code> properties:
      * <ul>
      * <li> If the component is checked and indeterminate, it will be displayed as partially checked
      * <li> If the component is checked and it is not indeterminate, it will be displayed as checked
      * <li> If the component is not checked, it will be displayed as not checked regardless value of the indeterminate attribute
      * </ul>
      *
      * @type {boolean}
      * @defaultvalue false
      * @public
      * @since 1.0.0-rc.15
      */
      indeterminate: {
        type: Boolean
      },

      /**
       * Defines if the component is checked.
       * <br><br>
       * <b>Note:</b> The property can be changed with user interaction,
       * either by cliking/tapping on the component, or by
       * pressing the Enter or Space key.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      checked: {
        type: Boolean
      },

      /**
       * Defines the text of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      text: {
        type: String
      },

      /**
       * Defines the value state of the component.
       *
       * <br><br>
       * <b>Note:</b>
       *
       * <ul>
       * <li><code>Warning</code></li>
       * <li><code>Error</code></li>
       * <li><code>None</code>(default)</li>
       * <li><code>Success</code></li>
       * <li><code>Information</code></li>
       * </ul>
       *
       * @type {ValueState}
       * @defaultvalue "None"
       * @public
       */
      valueState: {
        type: _ValueState.default,
        defaultValue: _ValueState.default.None
      },

      /**
       * Defines whether the component text wraps when there is not enough space.
       * <br><br>
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
       * Determines the name with which the component will be submitted in an HTML form.
       *
       * <br><br>
       * <b>Important:</b> For the <code>name</code> property to have effect, you must add the following import to your project:
       * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
       *
       * <br><br>
       * <b>Note:</b> When set, a native <code>input</code> HTML element
       * will be created inside the component so that it can be submitted as
       * part of an HTML form. Do not use this property unless you need to submit a form.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      name: {
        type: String
      },

      /**
       * Defines the active state (pressed or not) of the component.
       * @private
       */
      active: {
        type: Boolean
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.CheckBox.prototype */
    {
      /**
       * Fired when the component checked state changes.
       *
       * @public
       * @event
       */
      change: {}
    },
    slots:
    /** @lends sap.ui.webcomponents.main.CheckBox.prototype */
    {
      /**
       * The slot is used to render native <code>input</code> HTML element within Light DOM to enable form submit,
       * when <code>name</code> property is set.
       * @type {HTMLElement[]}
       * @slot
       * @private
       */
      formSupport: {
        type: HTMLElement
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * Allows the user to set a binary value, such as true/false or yes/no for an item.
   * <br><br>
   * The <code>ui5-checkbox</code> component consists of a box and a label that describes its purpose.
   * If it's checked, an indicator is displayed inside the box.
   * To check/uncheck the <code>ui5-checkbox</code>, the user has to click or tap the square
   * box or its label.
   * <br><br>
   * The <code>ui5-checkbox</code> component only has 2 states - checked and unchecked.
   * Clicking or tapping toggles the <code>ui5-checkbox</code> between checked and unchecked state.
   *
   * <h3>Usage</h3>
   *
   * You can define the checkbox text with via the <code>text</code> property. If the text exceeds the available width, it is truncated by default.
   * In case you prefer text to wrap, set the <code>wrappingType</code> property to "Normal".
   * The touchable area for toggling the <code>ui5-checkbox</code> ends where the text ends.
   * <br><br>
   * You can disable the <code>ui5-checkbox</code> by setting the <code>disabled</code> property to
   * <code>true</code>,
   * or use the <code>ui5-checkbox</code> in read-only mode by setting the <code>readonly</code>
   * property to <code>true</code>.
   *
   * <br><br>
   * <h3>Keyboard Handling</h3>
   *
   * The user can use the following keyboard shortcuts to toggle the checked state of the <code>ui5-checkbox</code>.
   * <ul>
   * <li>[SPACE, ENTER] - Toggles between different states: checked, not checked.</li>
   * </ul>
   * <br><br>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/CheckBox";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.CheckBox
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-checkbox
   * @public
   */

  class CheckBox extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _CheckBoxTemplate.default;
    }

    static get styles() {
      return _CheckBox.default;
    }

    constructor() {
      super();

      this._deactivate = () => {
        if (activeCb) {
          activeCb.active = false;
        }
      };

      if (!isGlobalHandlerAttached) {
        document.addEventListener("mouseup", this._deactivate);
        isGlobalHandlerAttached = true;
      }
    }

    onBeforeRendering() {
      this._enableFormSupport();
    }

    _enableFormSupport() {
      const FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");

      if (FormSupport) {
        FormSupport.syncNativeHiddenInput(this, (element, nativeInput) => {
          nativeInput.disabled = element.disabled || !element.checked;
          nativeInput.value = element.checked ? "on" : "";
        });
      } else if (this.name) {
        console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }
    }

    _onclick() {
      this.toggle();
    }

    _onmousedown() {
      if (this.readonly || this.disabled) {
        return;
      }

      this.active = true;
      activeCb = this; // eslint-disable-line
    }

    _onmouseup() {
      this.active = false;
    }

    _onfocusout() {
      this.active = false;
    }

    _onkeydown(event) {
      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
        this.active = true;
      }

      if ((0, _Keys.isEnter)(event)) {
        this.toggle();
        this.active = true;
      }
    }

    _onkeyup(event) {
      if ((0, _Keys.isSpace)(event)) {
        this.toggle();
      }

      this.active = false;
    }

    toggle() {
      if (this.canToggle()) {
        if (this.indeterminate) {
          this.indeterminate = false;
          this.checked = true;
        } else {
          this.checked = !this.checked;
        }

        this.fireEvent("change"); // Angular two way data binding

        this.fireEvent("value-changed");
      }

      return this;
    }

    canToggle() {
      return !(this.disabled || this.readonly);
    }

    valueStateTextMappings() {
      return {
        "Error": CheckBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        "Warning": CheckBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING),
        "Success": CheckBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS)
      };
    }

    get ariaLabelText() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }

    get classes() {
      return {
        main: {
          "ui5-checkbox--hoverable": !this.disabled && !this.readonly && (0, _Device.isDesktop)()
        }
      };
    }

    get ariaReadonly() {
      return this.readonly ? "true" : undefined;
    }

    get ariaDisabled() {
      return this.disabled ? "true" : undefined;
    }

    get ariaChecked() {
      return this.indeterminate && this.checked ? "mixed" : this.checked;
    }

    get ariaLabelledBy() {
      if (!this.ariaLabelText) {
        return this.text ? `${this._id}-label` : undefined;
      }

      return undefined;
    }

    get ariaDescribedBy() {
      return this.hasValueState ? `${this._id}-descr` : undefined;
    }

    get hasValueState() {
      return this.valueState !== _ValueState.default.None;
    }

    get valueStateText() {
      return this.valueStateTextMappings()[this.valueState];
    }

    get tabIndex() {
      const tabindex = this.getAttribute("tabindex");
      return this.disabled ? undefined : tabindex || "0";
    }

    get isCompletelyChecked() {
      return this.checked && !this.indeterminate;
    }

    static get dependencies() {
      return [_Label.default, _Icon.default];
    }

    static async onDefine() {
      CheckBox.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

  }

  CheckBox.define();
  var _default = CheckBox;
  _exports.default = _default;
});