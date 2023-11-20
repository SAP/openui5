sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/Device", "./generated/templates/SelectMenuTemplate.lit", "./generated/themes/SelectMenu.css", "./generated/themes/ValueStateMessage.css", "./generated/themes/ResponsivePopoverCommon.css", "./ResponsivePopover", "./List", "./Button"], function (_exports, _UI5Element, _customElement, _Integer, _slot, _event, _property, _LitRenderer, _ValueState, _Device, _SelectMenuTemplate, _SelectMenu, _ValueStateMessage, _ResponsivePopoverCommon, _ResponsivePopover, _List, _Button) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _Integer = _interopRequireDefault(_Integer);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ValueState = _interopRequireDefault(_ValueState);
  _SelectMenuTemplate = _interopRequireDefault(_SelectMenuTemplate);
  _SelectMenu = _interopRequireDefault(_SelectMenu);
  _ValueStateMessage = _interopRequireDefault(_ValueStateMessage);
  _ResponsivePopoverCommon = _interopRequireDefault(_ResponsivePopoverCommon);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _List = _interopRequireDefault(_List);
  _Button = _interopRequireDefault(_Button);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Template

  // Styles

  // Deps

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-select-menu</code> is meant to be used together with the <code>ui5-select</code> component as alternative
   * to define the select's dropdown. It acts as a popover on desktop and tablet, and as a Dialog on phone.
   * <br></br>
   * The component gives the possibility to the user to customize the <code>ui5-select</code>'s dropdown
   * by slotting custom options and adding custom styles.
   *
   * <h3>Usage</h3>
   *
   * To use <code>ui5-select</code> with a <code>ui5-select-menu</code>,
   * you need to set the <code>ui5-select</code> <code>menu</code> property to reference <code>ui5-select-menu</code> either by ID or DOM reference.
   * <br></br>
   *
   * For the <code>ui5-select-menu</code>
   * <h3>ES6 Module Import</h3>
   *
   * <code>import @ui5/webcomponents/dist/SelectMenu.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.SelectMenu
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-select-menu
   * @public
   * @since 1.17.0
   */
  let SelectMenu = class SelectMenu extends _UI5Element.default {
    constructor() {
      super();
      this.valueStateMessageText = [];
    }
    /**
     * Shows the dropdown at the given element.
     */
    showAt(opener, openerWidth) {
      this.selectWidth = openerWidth;
      this.respPopover.open = true;
      this.respPopover.opener = opener;
      this.hasValueState = !!opener.hasValueState;
      this.hasValueStateSlot = opener.valueStateMessageText.length > 0;
      this.valueStateText = opener.valueStateText;
      this.valueStateMessageText = opener.valueStateMessageText;
      this.valueState = opener.valueState;
      this._headerTitleText = opener._headerTitleText;
    }
    /**
     * Closes the dropdown.
     */
    close(escPressed = false, preventRegistryUpdate = false, preventFocusRestore = false) {
      this.respPopover.close(escPressed, preventRegistryUpdate, preventFocusRestore);
    }
    onBeforeRendering() {
      this._syncSelection();
    }
    _syncSelection() {
      let lastSelectedOptionIndex = -1,
        firstEnabledOptionIndex = -1,
        text,
        selectedIndex;
      const options = this.options;
      options.forEach((opt, index) => {
        if (opt.selected || opt.textContent === this.value) {
          // The second condition in the IF statement is added because of Angular Reactive Forms Support(Two way data binding)
          lastSelectedOptionIndex = index;
        }
        if (firstEnabledOptionIndex === -1) {
          firstEnabledOptionIndex = index;
        }
        opt.selected = false;
        opt.focused = false;
        return opt;
      });
      if (lastSelectedOptionIndex > -1) {
        const lastSelectedOption = options[lastSelectedOptionIndex];
        lastSelectedOption.selected = true;
        lastSelectedOption.focused = true;
        text = lastSelectedOption.displayText || String(lastSelectedOption.textContent);
        selectedIndex = lastSelectedOptionIndex;
      } else {
        text = "";
        selectedIndex = -1;
        const firstSelectedOption = options[firstEnabledOptionIndex];
        if (firstSelectedOption) {
          firstSelectedOption.selected = true;
          firstSelectedOption.focused = true;
          selectedIndex = firstEnabledOptionIndex;
          text = firstSelectedOption.displayText || String(firstSelectedOption.textContent);
        }
      }
      this.fireEvent("menu-change", {
        text,
        selectedIndex
      });
    }
    _onOptionClick(e) {
      const option = e.detail.item;
      const optionIndex = this.options.findIndex(_option => option.__id === _option.__id);
      this.fireEvent("option-click", {
        option,
        optionIndex
      });
    }
    _onBeforeOpen() {
      this.fireEvent("before-open");
    }
    _onAfterOpen() {
      this.fireEvent("after-open");
    }
    _onAfterClose() {
      this.fireEvent("after-close");
    }
    _onCloseBtnClick() {
      this.close();
    }
    get open() {
      return !!this.respPopover?.open;
    }
    get respPopover() {
      return this.shadowRoot.querySelector(".ui5-select-menu");
    }
    get classes() {
      return {
        popoverValueState: {
          "ui5-valuestatemessage-root": true,
          "ui5-valuestatemessage--success": this.valueState === _ValueState.default.Success,
          "ui5-valuestatemessage--error": this.valueState === _ValueState.default.Error,
          "ui5-valuestatemessage--warning": this.valueState === _ValueState.default.Warning,
          "ui5-valuestatemessage--information": this.valueState === _ValueState.default.Information
        },
        popover: {
          "ui5-select-popover-valuestate": this.hasValueState
        }
      };
    }
    get styles() {
      return {
        responsivePopoverHeader: {
          "display": this.options.length && this.respPopover?.offsetWidth === 0 ? "none" : "inline-block",
          "width": `${this.selectWidth}px`
        },
        responsivePopover: {
          "min-width": `${this.selectWidth}px`
        }
      };
    }
    get _valueStateMessageInputIcon() {
      const iconPerValueState = {
        Error: "error",
        Warning: "alert",
        Success: "sys-enter-2",
        Information: "information"
      };
      return this.valueState !== _ValueState.default.None ? iconPerValueState[this.valueState] : "";
    }
    get _isPhone() {
      return (0, _Device.isPhone)();
    }
  };
  __decorate([(0, _slot.default)({
    "default": true,
    type: HTMLElement,
    invalidateOnChildChange: true
  })], SelectMenu.prototype, "options", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default
  })], SelectMenu.prototype, "selectWidth", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SelectMenu.prototype, "hasValueState", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SelectMenu.prototype, "hasValueStateSlot", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], SelectMenu.prototype, "valueState", void 0);
  __decorate([(0, _property.default)()], SelectMenu.prototype, "valueStateText", void 0);
  __decorate([(0, _property.default)()], SelectMenu.prototype, "value", void 0);
  SelectMenu = __decorate([(0, _customElement.default)({
    tag: "ui5-select-menu",
    renderer: _LitRenderer.default,
    styles: [_SelectMenu.default, _ValueStateMessage.default, _ResponsivePopoverCommon.default],
    template: _SelectMenuTemplate.default,
    dependencies: [_ResponsivePopover.default, _List.default, _Button.default]
  }), (0, _event.default)("option-click", {
    detail: {
      option: {
        type: HTMLElement
      },
      optionIndex: {
        type: _Integer.default
      }
    }
  }), (0, _event.default)("before-open"), (0, _event.default)("after-open"), (0, _event.default)("after-close"), (0, _event.default)("menu-change", {
    detail: {
      text: {
        type: String
      },
      selectedIndex: {
        type: _Integer.default
      }
    }
  })], SelectMenu);
  SelectMenu.define();
  var _default = SelectMenu;
  _exports.default = _default;
});