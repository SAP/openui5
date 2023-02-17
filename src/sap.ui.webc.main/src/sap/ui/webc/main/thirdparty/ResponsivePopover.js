sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/util/PopupUtils", "./generated/i18n/i18n-defaults", "./generated/templates/ResponsivePopoverTemplate.lit", "./Popover", "./Dialog", "./Button", "./Title", "sap/ui/webc/common/thirdparty/icons/decline", "./generated/themes/ResponsivePopover.css"], function (_exports, _Device, _i18nBundle, _PopupUtils, _i18nDefaults, _ResponsivePopoverTemplate, _Popover, _Dialog, _Button, _Title, _decline, _ResponsivePopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _ResponsivePopoverTemplate = _interopRequireDefault(_ResponsivePopoverTemplate);
  _Popover = _interopRequireDefault(_Popover);
  _Dialog = _interopRequireDefault(_Dialog);
  _Button = _interopRequireDefault(_Button);
  _Title = _interopRequireDefault(_Title);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-responsive-popover",
    properties: /** @lends sap.ui.webcomponents.main.ResponsivePopover.prototype */{
      /**
       * Defines if only the content would be displayed (without header and footer) in the popover on Desktop.
       * By default both the header and footer would be displayed.
       * @private
       */
      contentOnlyOnDesktop: {
        type: Boolean
      },
      /**
       * Used internaly for controls which must not have header.
       * @private
       */
      _hideHeader: {
        type: Boolean
      },
      /**
       * Defines whether a close button will be rendered in the header of the component
       * <b>Note:</b> If you are using the <code>header</code> slot, this property will have no effect
       *
       * @private
       * @type {boolean}
       * @defaultvalue false
       * @since 1.0.0-rc.16
       */
      _hideCloseButton: {
        type: Boolean
      }
    }
  };

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
   * @alias sap.ui.webcomponents.main.ResponsivePopover
   * @extends Popover
   * @tagname ui5-responsive-popover
   * @since 1.0.0-rc.6
   * @public
   */
  class ResponsivePopover extends _Popover.default {
    constructor() {
      super();
    }
    static get metadata() {
      return metadata;
    }
    static get styles() {
      return [_Popover.default.styles, _ResponsivePopover.default];
    }
    get classes() {
      const allClasses = super.classes;
      allClasses.header = {
        "ui5-responsive-popover-header": true,
        "ui5-responsive-popover-header-no-title": !this.headerText
      };
      return allClasses;
    }
    static get template() {
      return _ResponsivePopoverTemplate.default;
    }
    static get dependencies() {
      return [..._Popover.default.dependencies, _Button.default, _Dialog.default, _Title.default];
    }

    /**
     * Shows popover on desktop and dialog on mobile.
     * @param {HTMLElement} opener the element that the popover is shown at
     * @param {boolean} preventInitialFocus Prevents applying the focus inside the popup
     * @public
     * @async
     * @returns {Promise} Resolves when the responsive popover is open
     */
    async showAt(opener, preventInitialFocus = false) {
      if (!(0, _Device.isPhone)()) {
        await super.showAt(opener, preventInitialFocus);
      } else {
        this.style.display = "contents";
        this.style.zIndex = (0, _PopupUtils.getNextZIndex)();
        await this._dialog.show(preventInitialFocus);
      }
    }

    /**
     * Closes the popover/dialog.
     * @public
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
     * Tells if the responsive popover is open
     * @public
     * @returns {boolean}
     */
    isOpen() {
      return (0, _Device.isPhone)() ? this._dialog.isOpen() : super.isOpen();
    }
    get _dialog() {
      return this.shadowRoot.querySelector("[ui5-dialog]");
    }
    get contentDOM() {
      return this._isPhone ? this._dialog.contentDOM : super.contentDOM;
    }
    get _isPhone() {
      return (0, _Device.isPhone)();
    }
    get _displayHeader() {
      return (this._isPhone || !this.contentOnlyOnDesktop) && super._displayHeader;
    }
    get _displayFooter() {
      return this._isPhone || !this.contentOnlyOnDesktop;
    }
    get _closeDialogAriaLabel() {
      return ResponsivePopover.i18nBundle.getText(_i18nDefaults.RESPONSIVE_POPOVER_CLOSE_DIALOG_BUTTON);
    }
    _beforeDialogOpen(event) {
      this.open = true;
      this.opened = true;
      this._propagateDialogEvent(event);
    }
    _afterDialogClose(event) {
      this.open = false;
      this.opened = false;
      this._propagateDialogEvent(event);
    }
    _propagateDialogEvent(event) {
      const type = event.type.replace("ui5-", "");
      this.fireEvent(type, event.detail);
    }
    static async onDefine() {
      ResponsivePopover.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  }
  ResponsivePopover.define();
  var _default = ResponsivePopover;
  _exports.default = _default;
});