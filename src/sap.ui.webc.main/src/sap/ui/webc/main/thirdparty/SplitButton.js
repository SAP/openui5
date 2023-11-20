sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/MarkedEvents", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/icons/slim-arrow-down", "./types/ButtonDesign", "./Button", "./generated/i18n/i18n-defaults", "./generated/templates/SplitButtonTemplate.lit", "./generated/themes/SplitButton.css"], function (_exports, _UI5Element, _customElement, _event, _property, _slot, _Keys, _i18nBundle, _MarkedEvents, _LitRenderer, _slimArrowDown, _ButtonDesign, _Button, _i18nDefaults, _SplitButtonTemplate, _SplitButton) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ButtonDesign = _interopRequireDefault(_ButtonDesign);
  _Button = _interopRequireDefault(_Button);
  _SplitButtonTemplate = _interopRequireDefault(_SplitButtonTemplate);
  _SplitButton = _interopRequireDefault(_SplitButton);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var SplitButton_1;

  // Template

  // Styles

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
   * <li><code>Arrow Down</code>, <code>Arrow Up</code>, <code>Alt</code>+<code>Arrow Down</code>, <code>Alt</code>+<code>Arrow Up</code>, or <code>F4</code> - triggers the arrow action</li>
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
   * @alias sap.ui.webc.main.SplitButton
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-split-button
   * @public
   * @since 1.1.0
   */
  let SplitButton = SplitButton_1 = class SplitButton extends _UI5Element.default {
    static async onDefine() {
      SplitButton_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
      const handleTouchStartEvent = () => {
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
    _onFocusOut(e) {
      if (this.disabled || (0, _MarkedEvents.getEventMark)(e)) {
        return;
      }
      this._shiftOrEscapePressed = false;
      this.focused = false;
      this._setTabIndexValue();
    }
    _onFocusIn(e) {
      if (this.disabled || (0, _MarkedEvents.getEventMark)(e)) {
        return;
      }
      this._shiftOrEscapePressed = false;
      this.focused = true;
    }
    _onKeyDown(e) {
      if ((0, _Keys.isDown)(e) || (0, _Keys.isUp)(e) || (0, _Keys.isDownAlt)(e) || (0, _Keys.isUpAlt)(e) || (0, _Keys.isF4)(e)) {
        e.preventDefault();
        this._arrowButtonActive = true;
        this._fireArrowClick();
      } else if ((0, _Keys.isSpace)(e) || (0, _Keys.isEnter)(e)) {
        e.preventDefault();
        this._textButtonActive = true;
        if ((0, _Keys.isEnter)(e)) {
          this._fireClick();
        } else {
          this._spacePressed = true;
        }
      }
      if (this._spacePressed && ((0, _Keys.isEscape)(e) || (0, _Keys.isShift)(e))) {
        this._shiftOrEscapePressed = true;
        this._textButtonActive = false;
      }
      this._setTabIndexValue();
    }
    _onKeyUp(e) {
      if ((0, _Keys.isDown)(e) || (0, _Keys.isUp)(e) || (0, _Keys.isDownAlt)(e) || (0, _Keys.isUpAlt)(e) || (0, _Keys.isF4)(e)) {
        this._arrowButtonActive = false;
      } else if ((0, _Keys.isSpace)(e) || (0, _Keys.isEnter)(e)) {
        this._textButtonActive = false;
        if ((0, _Keys.isSpace)(e)) {
          e.preventDefault();
          e.stopPropagation();
          this._fireClick();
          this._spacePressed = false;
        }
      }
      this._setTabIndexValue();
    }
    _fireClick(e) {
      e?.stopPropagation();
      if (!this._shiftOrEscapePressed) {
        this.fireEvent("click");
      }
      this._shiftOrEscapePressed = false;
    }
    _fireArrowClick(e) {
      e?.stopPropagation();
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
    get isTextButton() {
      return !!this.textContent;
    }
    get textButton() {
      return this.getDomRef()?.querySelector(".ui5-split-text-button");
    }
    get arrowButton() {
      return this.getDomRef()?.querySelector(".ui5-split-arrow-button");
    }
    get accessibilityInfo() {
      return {
        // affects arrow button
        ariaExpanded: this._splitButtonAccInfo && this._splitButtonAccInfo.ariaExpanded,
        ariaHaspopup: this._splitButtonAccInfo && this._splitButtonAccInfo.ariaHaspopup,
        // affects root element
        description: SplitButton_1.i18nBundle.getText(_i18nDefaults.SPLIT_BUTTON_DESCRIPTION),
        keyboardHint: SplitButton_1.i18nBundle.getText(_i18nDefaults.SPLIT_BUTTON_KEYBOARD_HINT)
      };
    }
    get ariaLabelText() {
      return [SplitButton_1.i18nBundle.getText(_i18nDefaults.SPLIT_BUTTON_DESCRIPTION), SplitButton_1.i18nBundle.getText(_i18nDefaults.SPLIT_BUTTON_KEYBOARD_HINT)].join(" ");
    }
  };
  __decorate([(0, _property.default)()], SplitButton.prototype, "icon", void 0);
  __decorate([(0, _property.default)()], SplitButton.prototype, "activeIcon", void 0);
  __decorate([(0, _property.default)({
    type: _ButtonDesign.default,
    defaultValue: _ButtonDesign.default.Default
  })], SplitButton.prototype, "design", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SplitButton.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], SplitButton.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SplitButton.prototype, "focused", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], SplitButton.prototype, "_splitButtonAccInfo", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "0",
    noAttribute: true
  })], SplitButton.prototype, "_tabIndex", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], SplitButton.prototype, "_spacePressed", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], SplitButton.prototype, "_shiftOrEscapePressed", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], SplitButton.prototype, "_textButtonActive", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], SplitButton.prototype, "_textButtonIcon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], SplitButton.prototype, "_arrowButtonActive", void 0);
  __decorate([(0, _slot.default)({
    type: Node,
    "default": true
  })], SplitButton.prototype, "text", void 0);
  SplitButton = SplitButton_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-split-button",
    renderer: _LitRenderer.default,
    styles: _SplitButton.default,
    template: _SplitButtonTemplate.default,
    dependencies: [_Button.default]
  })
  /**
   * Fired when the user clicks on the default action.
   * @event sap.ui.webc.main.SplitButton#click
   * @public
   */, (0, _event.default)("click")
  /**
   * Fired when the user clicks on the arrow action.
   * @event sap.ui.webc.main.SplitButton#arrow-click
   * @public
   */, (0, _event.default)("arrow-click")], SplitButton);
  SplitButton.define();
  var _default = SplitButton;
  _exports.default = _default;
});