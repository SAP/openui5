sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "./generated/templates/SplitButtonTemplate.lit", "./types/ButtonDesign", "./Button", "./generated/i18n/i18n-defaults", "./generated/themes/SplitButton.css"], function (_exports, _UI5Element, _Keys, _i18nBundle, _LitRenderer, _SplitButtonTemplate, _ButtonDesign, _Button, _i18nDefaults, _SplitButton) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _SplitButtonTemplate = _interopRequireDefault(_SplitButtonTemplate);
  _ButtonDesign = _interopRequireDefault(_ButtonDesign);
  _Button = _interopRequireDefault(_Button);
  _SplitButton = _interopRequireDefault(_SplitButton);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-split-button",
    managedSlots: true,
    properties: /** @lends sap.ui.webcomponents.main.SplitButton.prototype */{
      /**
       * Defines the icon to be displayed as graphical element within the component.
       * The SAP-icons font provides numerous options.
       * <br><br>
       * Example:
       *
       * See all the available icons in the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      icon: {
        type: String
      },
      /**
       * Defines the icon to be displayed in active state as graphical element within the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      activeIcon: {
        type: String
      },
      /**
       * Defines the component design.
       *
       * <br><br>
       * <b>The available values are:</b>
       *
       * <ul>
       * <li><code>Default</code></li>
       * <li><code>Emphasized</code></li>
       * <li><code>Positive</code></li>
       * <li><code>Negative</code></li>
       * <li><code>Transparent</code></li>
       * <li><code>Attention</code></li>
       * </ul>
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
       * Defines whether the component is disabled.
       * A disabled component can't be pressed or
       * focused, and it is not in the tab chain.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },
      /**
       * Defines the accessible aria name of the component.
       *
       * @type {string}
       * @defaultvalue: ""
       * @public
       */
      accessibleName: {
        type: String,
        defaultValue: undefined
      },
      /**
       * Indicates if the elements is on focus
       * @type {boolean}
       * @defaultvalue false
       * @private
       */
      focused: {
        type: Boolean
      },
      /**
       * Accessibility-related properties for inner elements of the Split Button
       *
       * @type {Object}
       * @private
       */
      _splitButtonAccInfo: {
        type: Object
      },
      /**
       * Defines the tabIndex of the component.
       * @type {string}
       * @defaultvalue ""
       * @private
       */
      _tabIndex: {
        type: String,
        defaultValue: "0",
        noAttribute: true
      },
      /**
       * Indicates if there is Space key pressed
       * @type {boolean}
       * @defaultvalue false
       * @private
       */
      _spacePressed: {
        type: Boolean,
        noAttribute: true
      },
      /**
       * Indicates if there is SHIFT or ESCAPE key pressed
       * @type {boolean}
       * @defaultvalue false
       * @private
       */
      _shiftOrEscapePressed: {
        type: Boolean,
        noAttribute: true
      },
      /**
       * Defines the active state of the text button
       * @type {boolean}
       * @defaultvalue false
       * @private
       */
      _textButtonActive: {
        type: Boolean,
        noAttribute: true
      },
      /**
       * Defines the icon of the text button
       * @type {string}
       * @defaultvalue ""
       * @private
       */
      _textButtonIcon: {
        type: String,
        noAttribute: true
      },
      /**
       * Defines the active state of the arrow button
       * @type {boolean}
       * @defaultvalue false
       * @private
       */
      _arrowButtonActive: {
        type: Boolean,
        noAttribute: true
      }
    },
    slots: /** @lends sap.ui.webcomponents.main.SplitButton.prototype */{
      /**
       * Defines the text of the component.
       * <br><br>
       * <b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
       *
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node,
        propertyName: "text"
      }
    },
    events: /** @lends sap.ui.webcomponents.main.SplitButton.prototype */{
      /**
       * Fired when the user clicks on the default action.
       * @event
       * @public
       */
      "click": {},
      /**
       * Fired when the user clicks on the arrow action.
       * @event sap.ui.webcomponents.main.SplitButton#arrow-click
       * @public
       */
      "arrow-click": {}
    }
  };

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * <code>ui5-split-button</code> enables users to trigger actions. It is constructed of two separate actions -
   * default action and arrow action that can be activated by clicking or tapping, or by
   * pressing certain keyboard keys - <code>Space</code> or <code>Enter</code> for default action,
   * and <code>Arrow Down</code> or <code>Arrow Up</code> for arrow action.
   *
   * <h3>Usage</h3>
   *
   * <code>ui5-split-button</code> consists two separate buttons:
   * <ul>
   * <li>for the first one (default action) you can define some <code>text</code> or an <code>icon</code>, or both.
   * Also, it is possible to define different icon for active state of this button - <code>activeIcon</code>.</li>
   * <li>the second one (arrow action) contains only <code>slim-arrow-down</code> icon.</li>
   * </ul>
   * You can choose a <code>design</code> from a set of predefined types (the same as for ui5-button) that offer
   * different styling to correspond to the triggered action. Both text and arrow actions have the same design.
   * <br><br>
   * You can set the <code>ui5-split-button</code> as enabled or disabled. Both parts of an enabled
   * <code>ui5-split-button</code> can be pressed by clicking or tapping it, or by certain keys, which changes
   * the style to provide visual feedback to the user that it is pressed or hovered over with
   * the mouse cursor. A disabled <code>ui5-split-button</code> appears inactive and any of the two buttons
   * cannot be pressed.
   *
   * <h3>Keyboard Handling</h3>
   * <ul>
   * <li><code>Space</code> or <code>Enter</code> - triggers the default action</li>
   * <li><code>Shift</code> or <code>Escape</code> - if <code>Space</code> is pressed, releases the default action button without triggering the click event.</li>
   * <li><code>Arrow Down</code>, <code>Arrow Up</code>, <code>Alt</code>+<code>Arrow Down</code>, <code>Alt</code>+<code>Arrow Up</code>, or <code>F4</code> - triggers the arrow action
   * There are separate events that are fired on activating of <code>ui5-split-button</code> parts:
   * <ul>
   * <li><code>click</code> for the first button (default action)</li>
   * <li><code>arrow-click</code> for the second button (arrow action)</li>
   * </ul>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/SplitButton.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.SplitButton
   * @extends UI5Element
   * @tagname ui5-split-button
   * @public
   * @since 1.1.0
   */
  class SplitButton extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get styles() {
      return _SplitButton.default;
    }
    static get template() {
      return _SplitButtonTemplate.default;
    }
    static get dependencies() {
      return [_Button.default];
    }
    static async onDefine() {
      SplitButton.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
      const handleTouchStartEvent = event => {
        this._textButtonActive = true;
        this.focused = false;
        this._setTabIndexValue();
      };
      this._textButtonPress = {
        handleEvent: handleTouchStartEvent,
        passive: true
      };
    }
    onBeforeRendering() {
      this._textButtonIcon = this.textButton && this.activeIcon !== "" && this._textButtonActive && !this._shiftOrEscapePressed ? this.activeIcon : this.icon;
      if (this.disabled) {
        this._tabIndex = "-1";
      }
    }
    _onFocusOut(event) {
      if (this.disabled || event.isMarked) {
        return;
      }
      this._shiftOrEscapePressed = false;
      this.focused = false;
      this._setTabIndexValue();
    }
    _onFocusIn(event) {
      if (this.disabled || event.isMarked) {
        return;
      }
      this._shiftOrEscapePressed = false;
      this.focused = true;
    }
    _onKeyDown(event) {
      if ((0, _Keys.isDown)(event) || (0, _Keys.isUp)(event) || (0, _Keys.isDownAlt)(event) || (0, _Keys.isUpAlt)(event) || (0, _Keys.isF4)(event)) {
        event.preventDefault();
        this._arrowButtonActive = true;
        this._fireArrowClick();
      } else if ((0, _Keys.isSpace)(event) || (0, _Keys.isEnter)(event)) {
        event.preventDefault();
        this._textButtonActive = true;
        if ((0, _Keys.isEnter)(event)) {
          this._fireClick();
        } else {
          this._spacePressed = true;
        }
      }
      if (this._spacePressed && ((0, _Keys.isEscape)(event) || (0, _Keys.isShift)(event))) {
        this._shiftOrEscapePressed = true;
        this._textButtonActive = false;
      }
      this._setTabIndexValue();
    }
    _onKeyUp(event) {
      if ((0, _Keys.isDown)(event) || (0, _Keys.isUp)(event) || (0, _Keys.isDownAlt)(event) || (0, _Keys.isUpAlt)(event) || (0, _Keys.isF4)(event)) {
        this._arrowButtonActive = false;
      } else if ((0, _Keys.isSpace)(event) || (0, _Keys.isEnter)(event)) {
        this._textButtonActive = false;
        if ((0, _Keys.isSpace)(event)) {
          event.preventDefault();
          event.stopPropagation();
          this._fireClick();
          this._spacePressed = false;
        }
      }
      this._setTabIndexValue();
    }
    _fireClick(event) {
      event && event.stopPropagation();
      if (!this._shiftOrEscapePressed) {
        this.fireEvent("click");
      }
      this._shiftOrEscapePressed = false;
    }
    _fireArrowClick(event) {
      event && event.stopPropagation();
      this.fireEvent("arrow-click");
    }
    _textButtonRelease() {
      this._textButtonActive = false;
      this._textButtonIcon = this.textButton && this.activeIcon !== "" && this._textButtonActive && !this._shiftOrEscapePressed ? this.activeIcon : this.icon;
      this._setTabIndexValue();
    }
    _setTabIndexValue() {
      const textButton = this.textButton,
        arrowButton = this.arrowButton,
        buttonsAction = textButton && (textButton.focused || textButton.active) || arrowButton && (arrowButton.focused || arrowButton.active);
      this._tabIndex = this.disabled || buttonsAction ? "-1" : "0";
    }
    get textButtonAccText() {
      return this.textContent;
    }
    get textButton() {
      return this.getDomRef() && this.getDomRef().querySelector(".ui5-split-text-button");
    }
    get arrowButton() {
      return this.getDomRef() && this.getDomRef().querySelector(".ui5-split-arrow-button");
    }
    get accessibilityInfo() {
      return {
        // affects arrow button
        ariaExpanded: this._splitButtonAccInfo && this._splitButtonAccInfo.ariaExpanded,
        ariaHaspopup: this._splitButtonAccInfo && this._splitButtonAccInfo.ariaHaspopup,
        // affects root element
        description: SplitButton.i18nBundle.getText(_i18nDefaults.SPLIT_BUTTON_DESCRIPTION),
        keyboardHint: SplitButton.i18nBundle.getText(_i18nDefaults.SPLIT_BUTTON_KEYBOARD_HINT)
      };
    }
    get ariaLabelText() {
      return [SplitButton.i18nBundle.getText(_i18nDefaults.SPLIT_BUTTON_DESCRIPTION), SplitButton.i18nBundle.getText(_i18nDefaults.SPLIT_BUTTON_KEYBOARD_HINT)].join(" ");
    }
  }
  SplitButton.define();
  var _default = SplitButton;
  _exports.default = _default;
});