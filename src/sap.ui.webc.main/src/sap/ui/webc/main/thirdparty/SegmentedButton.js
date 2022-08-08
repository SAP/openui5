sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/Keys", "./generated/i18n/i18n-defaults", "./SegmentedButtonItem", "./generated/templates/SegmentedButtonTemplate.lit", "./generated/themes/SegmentedButton.css"], function (_exports, _UI5Element, _ItemNavigation, _LitRenderer, _i18nBundle, _ResizeHandler, _Render, _Keys, _i18nDefaults, _SegmentedButtonItem, _SegmentedButtonTemplate, _SegmentedButton) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _SegmentedButtonItem = _interopRequireDefault(_SegmentedButtonItem);
  _SegmentedButtonTemplate = _interopRequireDefault(_SegmentedButtonTemplate);
  _SegmentedButton = _interopRequireDefault(_SegmentedButton);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-segmented-button",
    altTag: "ui5-segmentedbutton",
    languageAware: true,
    properties:
    /** @lends sap.ui.webcomponents.main.SegmentedButton.prototype */
    {
      /**
       * Defines the accessible aria name of the component.
       *
       * @type {string}
       * @defaultvalue: ""
       * @public
       * @since 1.0.3
       */
      accessibleName: {
        type: String,
        defaultValue: undefined
      }
    },
    managedSlots: true,
    slots:
    /** @lends sap.ui.webcomponents.main.SegmentedButton.prototype */
    {
      /**
       * Defines the items of <code>ui5-segmented-button</code>.
       * <br><br>
       * <b>Note:</b> Multiple items are allowed.
       * <br><br>
       * <b>Note:</b> Use the <code>ui5-segmented-button-item</code> for the intended design.
       * @type {sap.ui.webcomponents.main.ISegmentedButtonItem[]}
       * @slot items
       * @public
       */
      "default": {
        propertyName: "items",
        type: HTMLElement
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.SegmentedButton.prototype */
    {
      /**
       * Fired when the selected item changes.
       *
       * @event sap.ui.webcomponents.main.SegmentedButton#selection-change
       * @param {HTMLElement} selectedItem the pressed item.
       * @public
       */
      "selection-change": {
        detail: {
          selectedItem: {
            type: HTMLElement
          }
        }
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-segmented-button</code> shows a group of items. When the user clicks or taps
   * one of the items, it stays in a pressed state. It automatically resizes the items
   * to fit proportionally within the component. When no width is set, the component uses the available width.
   * <br><br>
   * <b>Note:</b> There can be just one selected <code>item</code> at a time.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/SegmentedButton";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.SegmentedButton
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-segmented-button
   * @since 1.0.0-rc.6
   * @appenddocs SegmentedButtonItem
   * @public
   */

  class SegmentedButton extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _SegmentedButtonTemplate.default;
    }

    static get styles() {
      return _SegmentedButton.default;
    }

    static get dependencies() {
      return [_SegmentedButtonItem.default];
    }

    static async onDefine() {
      SegmentedButton.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

    constructor() {
      super();
      this._itemNavigation = new _ItemNavigation.default(this, {
        getItemsCallback: () => this.getSlottedNodes("items")
      });
      this.absoluteWidthSet = false; // set to true whenever we set absolute width to the component

      this.percentageWidthSet = false; //  set to true whenever we set 100% width to the component

      this.hasPreviouslyFocusedItem = false;
      this._handleResizeBound = this._doLayout.bind(this);
    }

    onEnterDOM() {
      _ResizeHandler.default.register(this.parentNode, this._handleResizeBound);
    }

    onExitDOM() {
      if (this.parentNode) {
        _ResizeHandler.default.deregister(this.parentNode, this._handleResizeBound);
      }
    }

    onBeforeRendering() {
      const items = this.getSlottedNodes("items");
      items.forEach((item, index, arr) => {
        item.posInSet = index + 1;
        item.sizeOfSet = arr.length;
      });
      this.normalizeSelection();
    }

    async onAfterRendering() {
      await this._doLayout();
    }

    prepareToMeasureItems() {
      this.style.width = "";
      this.items.forEach(item => {
        item.style.width = "";
      });
    }

    async measureItemsWidth() {
      await (0, _Render.renderFinished)();
      this.prepareToMeasureItems();
      this.widths = this.items.map(item => {
        // +1 is added because for width 100.44px the offsetWidth property returns 100px and not 101px
        return item.offsetWidth + 1;
      });
    }

    normalizeSelection() {
      this._selectedItem = this.items.filter(item => item.pressed).pop();

      if (this._selectedItem) {
        this.items.forEach(item => {
          item.pressed = false;
        });
        this._selectedItem.pressed = true;
      }
    }

    _selectItem(event) {
      if (event.target.disabled || event.target === this.getDomRef()) {
        return;
      }

      if (event.target !== this._selectedItem) {
        if (this._selectedItem) {
          this._selectedItem.pressed = false;
        }

        this._selectedItem = event.target;
        this.fireEvent("selection-change", {
          selectedItem: this._selectedItem
        });
      }

      this._selectedItem.pressed = true;

      this._itemNavigation.setCurrentItem(this._selectedItem);

      return this;
    }

    _onclick(event) {
      this._selectItem(event);

      this.selectedItem.focus();
    }

    _onkeydown(event) {
      if ((0, _Keys.isEnter)(event)) {
        this._selectItem(event);
      } else if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
      }
    }

    _onkeyup(event) {
      if ((0, _Keys.isSpace)(event)) {
        this._selectItem(event);
      }
    }

    _onfocusin(event) {
      // If the component was previously focused,
      // update the ItemNavigation to sync butons` tabindex values
      if (this.hasPreviouslyFocusedItem) {
        this._itemNavigation.setCurrentItem(event.target);

        return;
      } // If the component is focused for the first time
      // focus the selected item if such present


      if (this.selectedItem) {
        this.selectedItem.focus();

        this._itemNavigation.setCurrentItem(this._selectedItem);

        this.hasPreviouslyFocusedItem = true;
      }
    }

    async _doLayout() {
      const itemsHaveWidth = this.widths && this.widths.some(item => item.offsetWidth > 2); // 2 are the pixel's added for rounding & IE

      if (!itemsHaveWidth) {
        await this.measureItemsWidth();
      }

      const parentWidth = this.parentNode ? this.parentNode.offsetWidth : 0;

      if (!this.style.width || this.percentageWidthSet) {
        this.style.width = `${Math.max(...this.widths) * this.items.length}px`;
        this.absoluteWidthSet = true;
      }

      this.items.forEach(item => {
        item.style.width = "100%";
      });

      if (parentWidth <= this.offsetWidth && this.absoluteWidthSet) {
        this.style.width = "100%";
        this.percentageWidthSet = true;
      }
    }
    /**
     * Currently selected item.
     *
     * @readonly
     * @type { sap.ui.webcomponents.main.ISegmentedButtonItem }
     * @public
     */


    get selectedItem() {
      return this._selectedItem;
    }

    get ariaDescribedBy() {
      return SegmentedButton.i18nBundle.getText(_i18nDefaults.SEGMENTEDBUTTON_ARIA_DESCRIBEDBY);
    }

    get ariaDescription() {
      return SegmentedButton.i18nBundle.getText(_i18nDefaults.SEGMENTEDBUTTON_ARIA_DESCRIPTION);
    }

  }

  SegmentedButton.define();
  var _default = SegmentedButton;
  _exports.default = _default;
});