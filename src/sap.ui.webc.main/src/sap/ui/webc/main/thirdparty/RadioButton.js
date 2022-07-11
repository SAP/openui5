sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/Keys", "./Label", "./RadioButtonGroup", "./types/WrappingType", "./generated/templates/RadioButtonTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/RadioButton.css"], function (_exports, _Device, _FeaturesRegistry, _UI5Element, _LitRenderer, _i18nBundle, _ValueState, _AriaLabelHelper, _Keys, _Label, _RadioButtonGroup, _WrappingType, _RadioButtonTemplate, _i18nDefaults, _RadioButton) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ValueState = _interopRequireDefault(_ValueState);
  _Label = _interopRequireDefault(_Label);
  _RadioButtonGroup = _interopRequireDefault(_RadioButtonGroup);
  _WrappingType = _interopRequireDefault(_WrappingType);
  _RadioButtonTemplate = _interopRequireDefault(_RadioButtonTemplate);
  _RadioButton = _interopRequireDefault(_RadioButton);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // i18n
  // Styles
  let isGlobalHandlerAttached = false;
  let activeRadio = null;
  /**
   * @public
   */

  const metadata = {
    tag: "ui5-radio-button",
    altTag: "ui5-radiobutton",
    languageAware: true,
    properties:
    /** @lends sap.ui.webcomponents.main.RadioButton.prototype */
    {
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
       * <b>Note:</b> A read-only component is not editable,
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
       * Defines whether the component is checked or not.
       * <br><br>
       * <b>Note:</b> The property value can be changed with user interaction,
       * either by clicking/tapping on the component,
       * or by using the Space or Enter key.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.15
       */
      checked: {
        type: Boolean
      },

      /**
       * Defines the text of the component.
       *
       * @type  {string}
       * @defaultvalue ""
       * @public
       */
      text: {
        type: String
      },

      /**
       * Defines the value state of the component.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>None</code></li>
       * <li><code>Error</code></li>
       * <li><code>Warning</code></li>
       * <li><code>Success</code></li>
       * <li><code>Information</code></li>
       * </ul>
       *
       * @type {ValueState}
       * @defaultvalue "None"
       * @public
       */
      valueState: {
        defaultValue: _ValueState.default.None,
        type: _ValueState.default
      },

      /**
       * Defines the name of the component.
       * Radio buttons with the same <code>name</code> will form a radio button group.
       *
       * <br><br>
       * <b>Note:</b>
       * The selection can be changed with <code>ARROW_UP/DOWN</code> and <code>ARROW_LEFT/RIGHT</code> keys between radio buttons in same group.
       *
       * <br><br>
       * <b>Note:</b>
       * Only one radio button can be selected per group.
       *
       * <br><br>
       * <b>Important:</b> For the <code>name</code> property to have effect when submitting forms, you must add the following import to your project:
       * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
       *
       * <br><br>
       * <b>Note:</b> When set, a native <code>input</code> HTML element
       * will be created inside the component so that it can be submitted as
       * part of an HTML form.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      name: {
        type: String
      },

      /**
       * Defines the form value of the component.
       * When a form with a radio button group is submitted, the group's value
       * will be the value of the currently selected radio button.
       * <br>
       * <b>Important:</b> For the <code>value</code> property to have effect, you must add the following import to your project:
       * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      value: {
        type: String
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
       * Defines the accessible name of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @private
       * @since 1.0.0-rc.16
       */
      accessibleName: {
        type: String
      },

      /**
       * Defines the IDs of the elements that label the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.1.0
       */
      accessibleNameRef: {
        type: String
      },
      _tabIndex: {
        type: String,
        defaultValue: "-1",
        noAttribute: true
      },

      /**
       * Defines the active state (pressed or not) of the component.
       * @private
       */
      active: {
        type: Boolean
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.RadioButton.prototype */
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
    },
    events:
    /** @lends sap.ui.webcomponents.main.RadioButton.prototype */
    {
      /**
       * Fired when the component checked state changes.
       *
       * @event
       * @public
       * @since 1.0.0-rc.15
       */
      change: {}
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-radio-button</code> component enables users to select a single option from a set of options.
   * When a <code>ui5-radio-button</code> is selected by the user, the
   * <code>change</code> event is fired.
   * When a <code>ui5-radio-button</code> that is within a group is selected, the one
   * that was previously selected gets automatically deselected. You can group radio buttons by using the <code>name</code> property.
   * <br>
   * <b>Note:</b> If <code>ui5-radio-button</code> is not part of a group, it can be selected once, but can not be deselected back.
   *
   * <h3>Keyboard Handling</h3>
   *
   * Once the <code>ui5-radio-button</code> is on focus, it might be selected by pressing the Space and Enter keys.
   * <br>
   * The Arrow Down/Arrow Up and Arrow Left/Arrow Right keys can be used to change selection between next/previous radio buttons in one group,
   * while TAB and SHIFT + TAB can be used to enter or leave the radio button group.
   * <br>
   * <b>Note:</b> On entering radio button group, the focus goes to the currently selected radio button.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/RadioButton";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.RadioButton
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-radio-button
   * @public
   */

  class RadioButton extends _UI5Element.default {
    constructor() {
      super();

      this._deactivate = () => {
        if (activeRadio) {
          activeRadio.active = false;
        }
      };

      if (!isGlobalHandlerAttached) {
        document.addEventListener("mouseup", this._deactivate);
        isGlobalHandlerAttached = true;
      }
    }

    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _RadioButtonTemplate.default;
    }

    static get styles() {
      return _RadioButton.default;
    }

    static get dependencies() {
      return [_Label.default];
    }

    static async onDefine() {
      RadioButton.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

    onBeforeRendering() {
      this.syncGroup();

      this._enableFormSupport();
    }

    syncGroup() {
      const oldGroup = this._name;
      const currentGroup = this.name;
      const oldChecked = this._checked;
      const currentChecked = this.checked;

      if (currentGroup !== oldGroup) {
        if (oldGroup) {
          // remove the control from the previous group
          _RadioButtonGroup.default.removeFromGroup(this, oldGroup);
        }

        if (currentGroup) {
          // add the control to the existing group
          _RadioButtonGroup.default.addToGroup(this, currentGroup);
        }
      } else if (currentGroup) {
        _RadioButtonGroup.default.enforceSingleSelection(this, currentGroup);
      }

      if (this.name && currentChecked !== oldChecked) {
        _RadioButtonGroup.default.updateTabOrder(this.name);
      }

      this._name = this.name;
      this._checked = this.checked;
    }

    _enableFormSupport() {
      const FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");

      if (FormSupport) {
        FormSupport.syncNativeHiddenInput(this, (element, nativeInput) => {
          nativeInput.disabled = element.disabled || !element.checked;
          nativeInput.value = element.checked ? element.value : "";
        });
      } else if (this.value) {
        console.warn(`In order for the "value" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }
    }

    _onclick() {
      return this.toggle();
    }

    _handleDown(event) {
      const currentGroup = this.name;

      if (!currentGroup) {
        return;
      }

      event.preventDefault();

      _RadioButtonGroup.default.selectNextItem(this, currentGroup);
    }

    _handleUp(event) {
      const currentGroup = this.name;

      if (!currentGroup) {
        return;
      }

      event.preventDefault();

      _RadioButtonGroup.default.selectPreviousItem(this, currentGroup);
    }

    _onkeydown(event) {
      if ((0, _Keys.isSpace)(event)) {
        this.active = true;
        return event.preventDefault();
      }

      if ((0, _Keys.isEnter)(event)) {
        this.active = true;
        return this.toggle();
      }

      if ((0, _Keys.isDown)(event) || (0, _Keys.isRight)(event)) {
        this._handleDown(event);
      }

      if ((0, _Keys.isUp)(event) || (0, _Keys.isLeft)(event)) {
        this._handleUp(event);
      }
    }

    _onkeyup(event) {
      if ((0, _Keys.isSpace)(event)) {
        this.toggle();
      }

      this.active = false;
    }

    _onmousedown() {
      this.active = true;
      activeRadio = this; // eslint-disable-line
    }

    _onmouseup() {
      this.active = false;
    }

    _onfocusout() {
      this.active = false;
    }

    toggle() {
      if (!this.canToggle()) {
        return this;
      }

      if (!this.name) {
        this.checked = !this.checked;
        this.fireEvent("change");
        return this;
      }

      _RadioButtonGroup.default.selectItem(this, this.name);

      return this;
    }

    canToggle() {
      return !(this.disabled || this.readonly || this.checked);
    }

    valueStateTextMappings() {
      return {
        "Error": RadioButton.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        "Warning": RadioButton.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING),
        "Success": RadioButton.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        "Information": RadioButton.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION)
      };
    }

    get classes() {
      return {
        main: {},
        inner: {
          "ui5-radio-inner--hoverable": !this.disabled && !this.readonly && (0, _Device.isDesktop)()
        }
      };
    }

    get ariaReadonly() {
      return this.readonly ? "true" : undefined;
    }

    get ariaDisabled() {
      return this.disabled ? "true" : undefined;
    }

    get ariaLabelText() {
      return [(0, _AriaLabelHelper.getEffectiveAriaLabelText)(this), this.text].filter(Boolean).join(" ");
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

      if (this.disabled) {
        return "-1";
      }

      if (this.name) {
        return this._tabIndex;
      }

      return tabindex || "0";
    }

    get strokeWidth() {
      return this.valueState === "None" ? "1" : "2";
    }

  }

  RadioButton.define();
  var _default = RadioButton;
  _exports.default = _default;
});