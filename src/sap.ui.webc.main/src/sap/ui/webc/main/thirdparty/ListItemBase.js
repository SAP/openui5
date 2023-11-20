sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/util/TabbableElements", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/getActiveElement", "./generated/themes/ListItemBase.css"], function (_exports, _UI5Element, _customElement, _LitRenderer, _property, _event, _TabbableElements, _Keys, _getActiveElement, _ListItemBase) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _getActiveElement = _interopRequireDefault(_getActiveElement);
  _ListItemBase = _interopRequireDefault(_ListItemBase);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Styles

  /**
   * @class
   * A class to serve as a foundation
   * for the <code>ListItem</code> and <code>GroupHeaderListItem</code> classes.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ListItemBase
   * @extends sap.ui.webc.base.UI5Element
   * @public
   */
  let ListItemBase = class ListItemBase extends _UI5Element.default {
    _onfocusin(e) {
      if (e.target !== this.getFocusDomRef()) {
        return;
      }
      this.focused = true;
      this.fireEvent("_focused", e);
    }
    _onfocusout() {
      this.focused = false;
    }
    _onkeydown(e) {
      if ((0, _Keys.isTabNext)(e)) {
        return this._handleTabNext(e);
      }
      if ((0, _Keys.isTabPrevious)(e)) {
        return this._handleTabPrevious(e);
      }
    }
    _onkeyup(e) {} // eslint-disable-line
    _handleTabNext(e) {
      if (this.shouldForwardTabAfter()) {
        if (!this.fireEvent("_forward-after", {}, true)) {
          e.preventDefault();
        }
      }
    }
    _handleTabPrevious(e) {
      const target = e.target;
      if (this.shouldForwardTabBefore(target)) {
        this.fireEvent("_forward-before");
      }
    }
    /*
    * Determines if th current list item either has no tabbable content or
    * [TAB] is performed onto the last tabbale content item.
    */
    shouldForwardTabAfter() {
      const aContent = (0, _TabbableElements.getTabbableElements)(this.getFocusDomRef());
      return aContent.length === 0 || aContent[aContent.length - 1] === (0, _getActiveElement.default)();
    }
    /*
    * Determines if the current list item is target of [SHIFT+TAB].
    */
    shouldForwardTabBefore(target) {
      return this.getFocusDomRef() === target;
    }
    get classes() {
      return {
        main: {
          "ui5-li-root": true,
          "ui5-li--focusable": !this.disabled
        }
      };
    }
    get _ariaDisabled() {
      return this.disabled ? true : undefined;
    }
    get hasConfigurableMode() {
      return false;
    }
    get _effectiveTabIndex() {
      if (this.disabled) {
        return -1;
      }
      if (this.selected) {
        return 0;
      }
      return this._tabIndex;
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], ListItemBase.prototype, "selected", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ListItemBase.prototype, "hasBorder", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "-1",
    noAttribute: true
  })], ListItemBase.prototype, "_tabIndex", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ListItemBase.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ListItemBase.prototype, "focused", void 0);
  ListItemBase = __decorate([(0, _customElement.default)({
    renderer: _LitRenderer.default,
    styles: _ListItemBase.default
  }), (0, _event.default)("_focused"), (0, _event.default)("_forward-after"), (0, _event.default)("_forward-before")], ListItemBase);
  var _default = ListItemBase;
  _exports.default = _default;
});