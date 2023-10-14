sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/util/PopupUtils", "./generated/i18n/i18n-defaults", "./generated/templates/ResponsivePopoverTemplate.lit", "./Popover", "./Dialog", "./Button", "./Title", "sap/ui/webc/common/thirdparty/icons/decline", "./generated/themes/ResponsivePopover.css"], function (_exports, _customElement, _property, _Device, _i18nBundle, _PopupUtils, _i18nDefaults, _ResponsivePopoverTemplate, _Popover, _Dialog, _Button, _Title, _decline, _ResponsivePopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _ResponsivePopoverTemplate = _interopRequireDefault(_ResponsivePopoverTemplate);
  _Popover = _interopRequireDefault(_Popover);
  _Dialog = _interopRequireDefault(_Dialog);
  _Button = _interopRequireDefault(_Button);
  _Title = _interopRequireDefault(_Title);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var ResponsivePopover_1;

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-responsive-popover</code> acts as a Popover on desktop and tablet, while on phone it acts as a Dialog.
   * The component improves tremendously the user experience on mobile.
   *
   * <h3>Usage</h3>
   * Use it when you want to make sure that all the content is visible on any device.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-responsive-popover</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>header - Used to style the header of the component</li>
   * <li>content - Used to style the content of the component</li>
   * <li>footer - Used to style the footer of the component</li>
   * </ul>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ResponsivePopover
   * @extends sap.ui.webc.main.Popover
   * @tagname ui5-responsive-popover
   * @since 1.0.0-rc.6
   * @public
   */
  let ResponsivePopover = ResponsivePopover_1 = class ResponsivePopover extends _Popover.default {
    constructor() {
      super();
    }
    /**
     * Shows popover on desktop and dialog on mobile.
     * @param {HTMLElement} opener the element that the popover is shown at
     * @param {boolean} [preventInitialFocus=false] Prevents applying the focus inside the popup
     * @public
     * @async
     * @method
     * @name sap.ui.webc.main.ResponsivePopover#showAt
     * @returns {Promise} Resolves when the responsive popover is open
     */
    async showAt(opener, preventInitialFocus = false) {
      if (!(0, _Device.isPhone)()) {
        await super.showAt(opener, preventInitialFocus);
      } else {
        this.style.display = "contents";
        const nextZIndex = (0, _PopupUtils.getNextZIndex)();
        if (!nextZIndex) {
          return;
        }
        this.style.zIndex = nextZIndex.toString();
        await this._dialog.show(preventInitialFocus);
      }
    }
    /**
     * Closes the popover/dialog.
     * @public
     * @method
     * @name sap.ui.webc.main.ResponsivePopover#close
     * @returns {void}
     */
    close(escPressed = false, preventRegistryUpdate = false, preventFocusRestore = false) {
      if (!(0, _Device.isPhone)()) {
        super.close(escPressed, preventRegistryUpdate, preventFocusRestore);
      } else {
        this._dialog.close(escPressed, preventRegistryUpdate, preventFocusRestore);
      }
    }
    toggle(opener) {
      if (this.isOpen()) {
        return this.close();
      }
      this.showAt(opener);
    }
    /**
     * Tells if the responsive popover is open.
     * @public
     * @method
     * @name sap.ui.webc.main.ResponsivePopover#isOpen
     * @returns {boolean}
     */
    isOpen() {
      return (0, _Device.isPhone)() && this._dialog ? this._dialog.isOpen() : super.isOpen();
    }
    get classes() {
      const allClasses = super.classes;
      allClasses.header = {
        "ui5-responsive-popover-header": true,
        "ui5-responsive-popover-header-no-title": !this.headerText
      };
      return allClasses;
    }
    get _dialog() {
      return this.shadowRoot.querySelector("[ui5-dialog]");
    }
    get contentDOM() {
      return (0, _Device.isPhone)() ? this._dialog.contentDOM : super.contentDOM;
    }
    get _isPhone() {
      return (0, _Device.isPhone)();
    }
    get _displayHeader() {
      return ((0, _Device.isPhone)() || !this.contentOnlyOnDesktop) && super._displayHeader;
    }
    get _displayFooter() {
      return (0, _Device.isPhone)() || !this.contentOnlyOnDesktop;
    }
    get _closeDialogAriaLabel() {
      return ResponsivePopover_1.i18nBundle.getText(_i18nDefaults.RESPONSIVE_POPOVER_CLOSE_DIALOG_BUTTON);
    }
    _beforeDialogOpen(e) {
      this.open = true;
      this.opened = true;
      this._propagateDialogEvent(e);
    }
    _afterDialogClose(e) {
      this.open = false;
      this.opened = false;
      this._propagateDialogEvent(e);
    }
    _propagateDialogEvent(e) {
      const type = e.type.replace("ui5-", "");
      this.fireEvent(type, e.detail);
    }
    get isModal() {
      if (!(0, _Device.isPhone)()) {
        return super.isModal;
      }
      return this._dialog.isModal;
    }
    static async onDefine() {
      ResponsivePopover_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], ResponsivePopover.prototype, "contentOnlyOnDesktop", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ResponsivePopover.prototype, "_hideHeader", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ResponsivePopover.prototype, "_hideCloseButton", void 0);
  ResponsivePopover = ResponsivePopover_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-responsive-popover",
    styles: [_Popover.default.styles, _ResponsivePopover.default],
    template: _ResponsivePopoverTemplate.default,
    dependencies: [..._Popover.default.dependencies, _Button.default, _Dialog.default, _Title.default]
  })], ResponsivePopover);
  ResponsivePopover.define();
  var _default = ResponsivePopover;
  _exports.default = _default;
});