sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/types/CSSSize", "./ToolbarRegistry", "./generated/templates/ToolbarSelectTemplate.lit", "./generated/templates/ToolbarPopoverSelectTemplate.lit", "./ToolbarItem", "./Select", "./Option", "./ToolbarSelectOption"], function (_exports, _customElement, _property, _slot, _event, _ValueState, _CSSSize, _ToolbarRegistry, _ToolbarSelectTemplate, _ToolbarPopoverSelectTemplate, _ToolbarItem, _Select, _Option, _ToolbarSelectOption) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _ValueState = _interopRequireDefault(_ValueState);
  _CSSSize = _interopRequireDefault(_CSSSize);
  _ToolbarSelectTemplate = _interopRequireDefault(_ToolbarSelectTemplate);
  _ToolbarPopoverSelectTemplate = _interopRequireDefault(_ToolbarPopoverSelectTemplate);
  _ToolbarItem = _interopRequireDefault(_ToolbarItem);
  _Select = _interopRequireDefault(_Select);
  _Option = _interopRequireDefault(_Option);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Templates

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-toolbar-select</code> component is used to create a toolbar drop-down list.
   * The items inside the <code>ui5-toolbar-select</code> define the available options by using the <code>ui5-toolbar-select-option</code> component.
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents/dist/ToolbarSelect";</code>
   * <br>
   * <code>import "@ui5/webcomponents/dist/ToolbarSelectOption";</code> (comes with <code>ui5-toolbar-select</code>)
   * @constructor
   * @abstract
   * @author SAP SE
   * @alias sap.ui.webc.main.ToolbarSelect
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-toolbar-select
   * @appenddocs sap.ui.webc.main.ToolbarSelectOption
   * @public
   * @implements sap.ui.webc.main.IToolbarItem
   * @since 1.17.0
   */
  let ToolbarSelect = class ToolbarSelect extends _ToolbarItem.default {
    static get toolbarTemplate() {
      return _ToolbarSelectTemplate.default;
    }
    static get toolbarPopoverTemplate() {
      return _ToolbarPopoverSelectTemplate.default;
    }
    get subscribedEvents() {
      const map = new Map();
      map.set("click", {
        preventClosing: true
      });
      map.set("change", {
        preventClosing: false
      });
      map.set("open", {
        preventClosing: true
      });
      map.set("close", {
        preventClosing: true
      });
      return map;
    }
    constructor() {
      super();
      this._onEvent = this._onEventHandler.bind(this);
    }
    onEnterDOM() {
      this.attachEventListeners();
    }
    onExitDOM() {
      this.detachEventListeners();
    }
    attachEventListeners() {
      [...this.subscribedEvents.keys()].forEach(e => {
        this.addEventListener(e, this._onEvent);
      });
    }
    detachEventListeners() {
      [...this.subscribedEvents.keys()].forEach(e => {
        this.removeEventListener(e, this._onEvent);
      });
    }
    _onEventHandler(e) {
      if (e.type === "change") {
        // update options
        const selectedOption = e.detail.selectedOption;
        const selectedOptionIndex = Number(selectedOption?.getAttribute("data-ui5-external-action-item-index"));
        this.options.forEach((option, index) => {
          if (index === selectedOptionIndex) {
            option.setAttribute("selected", "");
          } else {
            option.removeAttribute("selected");
          }
        });
      }
    }
    get styles() {
      return {
        width: this.width
      };
    }
  };
  __decorate([(0, _property.default)({
    validator: _CSSSize.default
  })], ToolbarSelect.prototype, "width", void 0);
  __decorate([(0, _slot.default)({
    "default": true,
    type: HTMLElement,
    invalidateOnChildChange: true
  })], ToolbarSelect.prototype, "options", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], ToolbarSelect.prototype, "valueState", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ToolbarSelect.prototype, "disabled", void 0);
  __decorate([(0, _property.default)()], ToolbarSelect.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)()], ToolbarSelect.prototype, "accessibleNameRef", void 0);
  ToolbarSelect = __decorate([(0, _customElement.default)({
    tag: "ui5-toolbar-select",
    dependencies: [_Select.default, _Option.default]
  })
  /**
   * Fired when the selected option changes.
   *
   * @event sap.ui.webc.main.ToolbarSelect#change
   * @allowPreventDefault
   * @param {HTMLElement} selectedOption the selected option.
   * @public
   */, (0, _event.default)("change", {
    detail: {
      selectedOption: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired after the component's dropdown menu opens.
   *
   * @event sap.ui.webc.main.ToolbarSelect#open
   * @public
   */, (0, _event.default)("open")
  /**
   * Fired after the component's dropdown menu closes.
   *
   * @event sap.ui.webc.main.ToolbarSelect#close
   * @public
   */, (0, _event.default)("close")], ToolbarSelect);
  (0, _ToolbarRegistry.registerToolbarItem)(ToolbarSelect);
  ToolbarSelect.define();
  var _default = ToolbarSelect;
  _exports.default = _default;
});