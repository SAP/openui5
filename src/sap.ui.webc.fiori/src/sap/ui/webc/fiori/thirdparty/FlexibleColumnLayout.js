sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/types/Float", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/types/AnimationMode", "sap/ui/webc/common/thirdparty/base/config/AnimationMode", "sap/ui/webc/main/thirdparty/Button", "sap/ui/webc/common/thirdparty/icons/slim-arrow-left", "sap/ui/webc/common/thirdparty/icons/slim-arrow-right", "./types/FCLLayout", "./fcl-utils/FCLLayout", "./generated/i18n/i18n-defaults", "./generated/templates/FlexibleColumnLayoutTemplate.lit", "./generated/themes/FlexibleColumnLayout.css"], function (_exports, _UI5Element, _LitRenderer, _ResizeHandler, _Float, _Integer, _i18nBundle, _AnimationMode, _AnimationMode2, _Button, _slimArrowLeft, _slimArrowRight, _FCLLayout, _FCLLayout2, _i18nDefaults, _FlexibleColumnLayoutTemplate, _FlexibleColumnLayout) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _Float = _interopRequireDefault(_Float);
  _Integer = _interopRequireDefault(_Integer);
  _AnimationMode = _interopRequireDefault(_AnimationMode);
  _Button = _interopRequireDefault(_Button);
  _FCLLayout = _interopRequireDefault(_FCLLayout);
  _FlexibleColumnLayoutTemplate = _interopRequireDefault(_FlexibleColumnLayoutTemplate);
  _FlexibleColumnLayout = _interopRequireDefault(_FlexibleColumnLayout);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Texts

  // Template

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-flexible-column-layout",
    fastNavigation: true,
    properties: /** @lends sap.ui.webcomponents.fiori.FlexibleColumnLayout.prototype */{
      /**
       * Defines the columns layout and their proportion.
       * <br><br>
       * <b>Note:</b> The layout also depends on the screen size - one column for screens smaller than 599px,
       * two columns between 599px and 1023px and three columns for sizes bigger than 1023px.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>OneColumn</code></li>
       * <li><code>TwoColumnsStartExpanded</code></li>
       * <li><code>TwoColumnsMidExpanded</code></li>
       * <li><code>ThreeColumnsMidExpanded</code></li>
       * <li><code>ThreeColumnsEndExpanded</code></li>
       * <li><code>ThreeColumnsStartExpandedEndHidden</code></li>
       * <li><code>ThreeColumnsMidExpandedEndHidden</code></li>
       * <li><code>MidColumnFullScreen</code></li>
       * <li><code>EndColumnFullScreen</code></li>
       * </ul>
       * <br><br>
       * <b>For example:</b> layout=<code>TwoColumnsStartExpanded</code> means the layout will display up to two columns
       * in 67%/33% proportion.
       * @type {FCLLayout}
       * @defaultvalue "OneColumn"
       * @public
       */
      layout: {
        type: _FCLLayout.default,
        defaultValue: _FCLLayout.default.OneColumn
      },
      /**
      * Defines the visibility of the arrows,
      * used for expanding and shrinking the columns.
      *
      * @type {boolean}
      * @defaultvalue false
      * @public
      * @since 1.0.0-rc.15
      */
      hideArrows: {
        type: Boolean
      },
      /**
       * An object of strings that defines several additional accessibility texts for even further customization.
       *
       * It supports the following fields:
       *  - <code>startColumnAccessibleName</code>: the accessibility name for the <code>startColumn</code> region
       *  - <code>midColumnAccessibleName</code>: the accessibility name for the <code>midColumn</code> region
       *  - <code>endColumnAccessibleName</code>: the accessibility name for the <code>endColumn</code> region
       *  - <code>startArrowLeftText</code>: the text that the first arrow (between the <code>begin</code> and <code>mid</code> columns) will have when pointing to the left
       *  - <code>startArrowRightText</code>: the text that the first arrow (between the <code>begin</code> and <code>mid</code> columns) will have when pointing to the right
       *  - <code>endArrowLeftText</code>: the text that the second arrow (between the <code>mid</code> and <code>end</code> columns) will have when pointing to the left
       *  - <code>endArrowRightText</code>: the text that the second arrow (between the <code>mid</code> and <code>end</code> columns) will have when pointing to the right
       *  - <code>startArrowContainerAccessibleName</code>: the text that the first arrow container (between the <code>begin</code> and <code>mid</code> columns) will have as <code>aria-label</code>
       *  - <code>endArrowContainerAccessibleName</code>: the text that the second arrow container (between the <code>mid</code> and <code>end</code> columns) will have as <code>aria-label</code>
       *
       * @type {object}
       * @public
       * @since 1.0.0-rc.11
       */
      accessibilityTexts: {
        type: Object
      },
      /**
       * An object of strings that defines additional accessibility roles for further customization.
       *
       * It supports the following fields:
       *  - <code>startColumnRole</code>: the accessibility role for the <code>startColumn</code>
       *  - <code>startArrowContainerRole</code>: the accessibility role for the first arrow container (between the <code>begin</code> and <code>mid</code> columns)
       *  - <code>midColumnRole</code>: the accessibility role for the <code>midColumn</code>
       *  - <code>endArrowContainerRole</code>: the accessibility role for the second arrow container (between the <code>mid</code> and <code>end</code> columns)
       *  - <code>endColumnRole</code>: the accessibility role for the <code>endColumn</code>
       *
       * @type {object}
       * @public
       * @since 1.1.0
       */
      accessibilityRoles: {
        type: Object
      },
      /**
      * Defines the component width in px.
      *
      * @type {Float}
      * @defaultvalue 0
      * @private
      */
      _width: {
        type: _Float.default,
        defaultValue: 0
      },
      /**
      * Defines the effective columns layout,
      * based on both the <code>layout</code> property and the screen size.
      * Example: [67%, 33%, 0], [25%, 50%, 25%], etc.
      *
      * @type {Object}
      * @defaultvalue undefined
      * @private
      */
      _columnLayout: {
        type: Object,
        defaultValue: undefined
      },
      /**
      * Defines the visible columns count - 1, 2 or 3.
      *
      * @type {Integer}
      * @defaultvalue 1
      * @private
      */
      _visibleColumns: {
        type: _Integer.default,
        defaultValue: 0
      },
      /**
       * Allows the user to replace the whole layouts configuration
       *
       * @type {Object}
       * @private
       * @sap-restricted
       */
      _layoutsConfiguration: {
        type: Object,
        defaultValue: undefined
      }
    },
    slots: /** @lends sap.ui.webcomponents.fiori.FlexibleColumnLayout.prototype */{
      /**
       * Defines the content in the start column.
       * @type {HTMLElement}
       * @slot
       * @public
       */
      startColumn: {
        type: HTMLElement
      },
      /**
       * Defines the content in the middle column.
       * @type {HTMLElement}
       * @slot
       * @public
       */
      midColumn: {
        type: HTMLElement
      },
      /**
       * Defines the content in the end column.
       * @type {HTMLElement}
       * @slot
       * @public
       */
      endColumn: {
        type: HTMLElement
      }
    },
    events: /** @lends sap.ui.webcomponents.fiori.FlexibleColumnLayout.prototype */{
      /**
       * Fired when the layout changes via user interaction by clicking the arrows
       * or by changing the component size due to resizing.
       *
       * @param {FCLLayout} layout The current layout
       * @param {Array} columnLayout The effective column layout, f.e [67%, 33%, 0]
       * @param {boolean} startColumnVisible Indicates if the start column is currently visible
       * @param {boolean} midColumnVisible Indicates if the middle column is currently visible
       * @param {boolean} endColumnVisible Indicates if the end column is currently visible
       * @param {boolean} arrowsUsed Indicates if the layout is changed via the arrows
       * @param {boolean} resize Indicates if the layout is changed via resizing
       * @event sap.ui.webcomponents.fiori.FlexibleColumnLayout#layout-change
       * @public
       */
      "layout-change": {
        detail: {
          layout: {
            type: _FCLLayout.default
          },
          columnLayout: {
            type: Array
          },
          startColumnVisible: {
            type: Boolean
          },
          midColumnVisible: {
            type: Boolean
          },
          endColumnVisible: {
            type: Boolean
          },
          arrowsUsed: {
            type: Boolean
          },
          resize: {
            type: Boolean
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
   * The <code>FlexibleColumnLayout</code> implements the list-detail-detail paradigm by displaying up to three pages in separate columns.
   * There are several possible layouts that can be changed either with the component API, or by pressing the arrows, displayed between the columns.
   *
   * <h3>Usage</h3>
   *
   * Use this component for applications that need to display several logical levels of related information side by side (e.g. list of items, item, sub-item, etc.).
   * The Component is flexible in a sense that the application can focus the user's attention on one particular column.
   *
   * <h3>Responsive Behavior</h3>
   *
   * The <code>FlexibleColumnLayout</code> automatically displays the maximum possible number of columns based on <code>layout</code> property and the window size.
   * The component would display 1 column for window size smaller than 599px, up to two columns between 599px and 1023px,
   * and 3 columns for sizes bigger than 1023px.
   *
   * <br><br>
   * <h3>Keyboard Handling</h3>
   *
   * <h4>Basic Navigation</h4>
   * <ul>
   * <li>[SPACE, ENTER, RETURN] - If focus is on the layout toggle button (arrow button), once activated, it triggers the associated action (such as expand/collapse the column).</li>
   * <li>This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code></li>
   * </ul>
   *
   * <h4>Fast Navigation</h4>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   * <br><br>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents-fiori/dist/FlexibleColumnLayout.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.FlexibleColumnLayout
   * @extends UI5Element
   * @tagname ui5-flexible-column-layout
   * @public
   * @since 1.0.0-rc.8
   */
  class FlexibleColumnLayout extends _UI5Element.default {
    constructor() {
      super();
      this._prevLayout = null;
      this.initialRendering = true;
      this._handleResize = this.handleResize.bind(this);
    }
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get styles() {
      return _FlexibleColumnLayout.default;
    }
    static get template() {
      return _FlexibleColumnLayoutTemplate.default;
    }
    static get dependencies() {
      return [_Button.default];
    }
    static async onDefine() {
      FlexibleColumnLayout.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
    static get BREAKPOINTS() {
      return {
        "PHONE": 599,
        "TABLET": 1023
      };
    }
    static get MEDIA() {
      return {
        PHONE: "phone",
        TABLET: "tablet",
        DESKTOP: "desktop"
      };
    }
    static get ANIMATION_DURATION() {
      return (0, _AnimationMode2.getAnimationMode)() !== _AnimationMode.default.None ? 560 : 0;
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._handleResize);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._handleResize);
      ["start", "mid", "end"].forEach(column => {
        this[`${column}ColumnDOM`].removeEventListener("transitionend", this.columnResizeHandler);
      });
    }
    onAfterRendering() {
      if (this.initialRendering) {
        this.handleInitialRendering();
        return;
      }
      this.syncLayout();
    }
    handleInitialRendering() {
      this._prevLayout = this.layout;
      this.updateLayout();
      this.initialRendering = false;
    }
    handleResize() {
      if (this.initialRendering) {
        return;
      }

      // store the previous layout
      const prevLayoutHash = this.columnLayout.join();

      // update the column layout, based on the current width
      this.updateLayout();

      // fire layout-change if the column layout changed
      if (prevLayoutHash !== this.columnLayout.join()) {
        this.fireLayoutChange(false, true);
      }
    }
    startArrowClick() {
      this.arrowClick({
        start: true,
        end: false
      });
    }
    endArrowClick() {
      this.arrowClick({
        start: false,
        end: true
      });
    }
    arrowClick({
      start,
      end
    }) {
      // update public property
      this.layout = this.nextLayout(this.layout, {
        start,
        end
      });

      // update layout
      this.updateLayout();

      // fire layout-change
      this.fireLayoutChange(true, false);
    }
    updateLayout() {
      this._width = this.widthDOM;
      this._columnLayout = this.nextColumnLayout(this.layout);
      this._visibleColumns = this.calcVisibleColumns(this._columnLayout);
      this.toggleColumns();
    }
    syncLayout() {
      if (this._prevLayout !== this.layout) {
        this.updateLayout();
        this._prevLayout = this.layout;
      }
    }
    toggleColumns() {
      this.toggleColumn("start");
      this.toggleColumn("mid");
      this.toggleColumn("end");
    }
    toggleColumn(column) {
      const columnWidth = this[`${column}ColumnWidth`];
      const columnDOM = this[`${column}ColumnDOM`];
      const currentlyHidden = columnWidth === 0;
      const previouslyHidden = columnDOM.style.width === "0px";

      // no change
      if (currentlyHidden && previouslyHidden) {
        return;
      }

      // column resizing: from 33% to 67%, from 25% to 50%, etc.
      if (!currentlyHidden && !previouslyHidden) {
        columnDOM.style.width = columnWidth;
        return;
      }

      // hide column: 33% to 0, 25% to 0, etc .
      if (currentlyHidden) {
        // animate the width
        columnDOM.style.width = columnWidth;

        // hide column with delay to allow the animation runs entirely
        columnDOM.addEventListener("transitionend", this.columnResizeHandler);
        return;
      }

      // show column: from 0 to 33%, from 0 to 25%, etc.
      if (previouslyHidden) {
        columnDOM.removeEventListener("transitionend", this.columnResizeHandler);
        columnDOM.classList.remove("ui5-fcl-column--hidden");
        columnDOM.style.width = columnWidth;
      }
    }
    columnResizeHandler(event) {
      event.target.classList.add("ui5-fcl-column--hidden");
    }
    nextLayout(layout, arrowsInfo = {}) {
      if (arrowsInfo.start) {
        return (0, _FCLLayout2.getNextLayoutByStartArrow)()[layout];
      }
      if (arrowsInfo.end) {
        return (0, _FCLLayout2.getNextLayoutByEndArrow)()[layout];
      }
    }
    nextColumnLayout(layout) {
      return this._effectiveLayoutsByMedia[this.media][layout].layout;
    }
    calcVisibleColumns(colLayot) {
      return colLayot.filter(col => col !== 0).length;
    }
    fireLayoutChange(arrowUsed, resize) {
      this.fireEvent("layout-change", {
        layout: this.layout,
        columnLayout: this._columnLayout,
        startColumnVisible: this.startColumnVisible,
        midColumnVisible: this.midColumnVisible,
        endColumnVisible: this.endColumnVisible,
        arrowUsed,
        // for backwards compatibility
        arrowsUsed: arrowUsed,
        // as documented
        resize
      });
    }

    /**
     * Returns the current column layout, based on both the <code>layout</code> property and the screen size.
     * <br><br>
     * <b>For example:</b> ["67%", "33%", 0], ["100%", 0, 0], ["25%", "50%", "25%"], etc,
     * where the numbers represents the width of the start, middle and end columns.
     * @readonly
     * @type { Array }
     * @defaultvalue ["100%", 0, 0]
     * @public
     */
    get columnLayout() {
      return this._columnLayout;
    }

    /**
     * Returns if the <code>start</code> column is visible.
     * @readonly
     * @defaultvalue true
     * @type { boolean }
     * @public
     */
    get startColumnVisible() {
      if (this._columnLayout) {
        return this._columnLayout[0] !== 0;
      }
      return false;
    }

    /**
     * Returns if the <code>middle</code> column is visible.
     * @readonly
     * @type { boolean }
     * @defaultvalue false
     * @public
     */
    get midColumnVisible() {
      if (this._columnLayout) {
        return this._columnLayout[1] !== 0;
      }
      return false;
    }

    /**
     * Returns if the <code>end</code> column is visible.
     * @readonly
     * @type { boolean }
     * @defaultvalue false
     * @public
     */
    get endColumnVisible() {
      if (this._columnLayout) {
        return this._columnLayout[2] !== 0;
      }
      return false;
    }

    /**
     * Returns the number of currently visible columns.
     * @readonly
     * @type { Integer }
     * @defaultvalue 1
     * @public
     */
    get visibleColumns() {
      return this._visibleColumns;
    }
    get classes() {
      const hasAnimation = (0, _AnimationMode2.getAnimationMode)() !== _AnimationMode.default.None;
      return {
        root: {
          "ui5-fcl-root": true
        },
        columns: {
          start: {
            "ui5-fcl-column": true,
            "ui5-fcl-column-animation": hasAnimation,
            "ui5-fcl-column--start": true
          },
          middle: {
            "ui5-fcl-column": true,
            "ui5-fcl-column-animation": hasAnimation,
            "ui5-fcl-column--middle": true
          },
          end: {
            "ui5-fcl-column": true,
            "ui5-fcl-column-animation": hasAnimation,
            "ui5-fcl-column--end": true
          }
        }
      };
    }
    get styles() {
      return {
        arrowsContainer: {
          start: {
            display: this.showStartSeparator ? "flex" : "none"
          },
          end: {
            display: this.showEndSeparator ? "flex" : "none"
          }
        },
        arrows: {
          start: {
            display: this.showStartArrow ? "inline-block" : "none",
            transform: this.startArrowDirection === "mirror" ? "rotate(180deg)" : ""
          },
          end: {
            display: this.showEndArrow ? "inline-block" : "none",
            transform: this.endArrowDirection === "mirror" ? "rotate(180deg)" : ""
          }
        }
      };
    }
    get startColumnWidth() {
      return this._columnLayout ? this._columnLayout[0] : "100%";
    }
    get midColumnWidth() {
      return this._columnLayout ? this._columnLayout[1] : 0;
    }
    get endColumnWidth() {
      return this._columnLayout ? this._columnLayout[2] : 0;
    }
    get showStartSeparator() {
      return this.effectiveArrowsInfo[0].separator || this.startArrowVisibility;
    }
    get showEndSeparator() {
      return this.effectiveArrowsInfo[1].separator || this.endArrowVisibility;
    }
    get showStartArrow() {
      return this.hideArrows ? false : this.startArrowVisibility;
    }
    get showEndArrow() {
      return this.hideArrows ? false : this.endArrowVisibility;
    }
    get startArrowVisibility() {
      return this.effectiveArrowsInfo[0].visible;
    }
    get endArrowVisibility() {
      return this.effectiveArrowsInfo[1].visible;
    }
    get startArrowDirection() {
      return this.effectiveArrowsInfo[0].dir;
    }
    get endArrowDirection() {
      return this.effectiveArrowsInfo[1].dir;
    }
    get effectiveArrowsInfo() {
      return this._effectiveLayoutsByMedia[this.media][this.layout].arrows;
    }
    get media() {
      if (this._width <= FlexibleColumnLayout.BREAKPOINTS.PHONE) {
        return FlexibleColumnLayout.MEDIA.PHONE;
      }
      if (this._width <= FlexibleColumnLayout.BREAKPOINTS.TABLET) {
        return FlexibleColumnLayout.MEDIA.TABLET;
      }
      return FlexibleColumnLayout.MEDIA.DESKTOP;
    }
    get widthDOM() {
      return this.getBoundingClientRect().width;
    }
    get startColumnDOM() {
      return this.shadowRoot.querySelector(".ui5-fcl-column--start");
    }
    get midColumnDOM() {
      return this.shadowRoot.querySelector(".ui5-fcl-column--middle");
    }
    get endColumnDOM() {
      return this.shadowRoot.querySelector(".ui5-fcl-column--end");
    }
    get accStartColumnText() {
      return this.accessibilityTexts.startColumnAccessibleName || FlexibleColumnLayout.i18nBundle.getText(_i18nDefaults.FCL_START_COLUMN_TXT);
    }
    get accMiddleColumnText() {
      return this.accessibilityTexts.midColumnAccessibleName || FlexibleColumnLayout.i18nBundle.getText(_i18nDefaults.FCL_MIDDLE_COLUMN_TXT);
    }
    get accEndColumnText() {
      return this.accessibilityTexts.endColumnAccessibleName || FlexibleColumnLayout.i18nBundle.getText(_i18nDefaults.FCL_END_COLUMN_TXT);
    }
    get accStartArrowContainerText() {
      return this.accessibilityTexts.startArrowContainerAccessibleName || undefined;
    }
    get accEndArrowContainerText() {
      return this.accessibilityTexts.endArrowContainerAccessibleName || undefined;
    }
    get accStartColumnRole() {
      if (this.startColumnVisible) {
        return this.accessibilityRoles.startColumnRole || "region";
      }
      return undefined;
    }
    get accMiddleColumnRole() {
      if (this.midColumnVisible) {
        return this.accessibilityRoles.midColumnRole || "region";
      }
      return undefined;
    }
    get accEndColumnRole() {
      if (this.endColumnVisible) {
        return this.accessibilityRoles.endColumnRole || "region";
      }
      return undefined;
    }
    get accStartArrowContainerRole() {
      return this.accessibilityRoles.startArrowContainerRole || undefined;
    }
    get accEndArrowContainerRole() {
      return this.accessibilityRoles.endArrowContainerRole || undefined;
    }
    get _effectiveLayoutsByMedia() {
      return this._layoutsConfiguration || (0, _FCLLayout2.getLayoutsByMedia)();
    }
    get _accAttributes() {
      return {
        columns: {
          start: {
            role: this.accStartColumnRole,
            ariaHidden: !this.startColumnVisible || undefined
          },
          middle: {
            role: this.accMiddleColumnRole,
            ariaHidden: !this.midColumnVisible || undefined
          },
          end: {
            role: this.accEndColumnRole,
            ariaHidden: !this.endColumnVisible || undefined
          }
        }
      };
    }
    get accStartArrowText() {
      const customTexts = this.accessibilityTexts;
      if (this.startArrowDirection === "mirror") {
        return customTexts.startArrowLeftText || FlexibleColumnLayout.i18nBundle.getText(_i18nDefaults.FCL_START_COLUMN_COLLAPSE_BUTTON_TOOLTIP);
      }
      return customTexts.startArrowRightText || FlexibleColumnLayout.i18nBundle.getText(_i18nDefaults.FCL_START_COLUMN_EXPAND_BUTTON_TOOLTIP);
    }
    get accEndArrowText() {
      const customTexts = this.accessibilityTexts;
      if (this.endArrowDirection === "mirror") {
        return customTexts.endArrowRightText || FlexibleColumnLayout.i18nBundle.getText(_i18nDefaults.FCL_END_COLUMN_COLLAPSE_BUTTON_TOOLTIP);
      }
      return customTexts.endArrowLeftText || FlexibleColumnLayout.i18nBundle.getText(_i18nDefaults.FCL_END_COLUMN_EXPAND_BUTTON_TOOLTIP);
    }
  }
  FlexibleColumnLayout.define();
  var _default = FlexibleColumnLayout;
  _exports.default = _default;
});