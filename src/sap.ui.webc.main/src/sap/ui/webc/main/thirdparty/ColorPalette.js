sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/types/CSSColor", "sap/ui/webc/common/thirdparty/base/types/ItemNavigationBehavior", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "./generated/templates/ColorPaletteTemplate.lit", "./generated/templates/ColorPaletteDialogTemplate.lit", "./ColorPaletteItem", "./Button", "./generated/i18n/i18n-defaults", "./generated/themes/ColorPalette.css", "./generated/themes/ColorPaletteStaticArea.css"], function (_exports, _UI5Element, _customElement, _property, _slot, _event, _LitRenderer, _i18nBundle, _ItemNavigation, _CSSColor, _ItemNavigationBehavior, _Device, _Keys, _FeaturesRegistry, _ColorPaletteTemplate, _ColorPaletteDialogTemplate, _ColorPaletteItem, _Button, _i18nDefaults, _ColorPalette, _ColorPaletteStaticArea) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _CSSColor = _interopRequireDefault(_CSSColor);
  _ItemNavigationBehavior = _interopRequireDefault(_ItemNavigationBehavior);
  _ColorPaletteTemplate = _interopRequireDefault(_ColorPaletteTemplate);
  _ColorPaletteDialogTemplate = _interopRequireDefault(_ColorPaletteDialogTemplate);
  _ColorPaletteItem = _interopRequireDefault(_ColorPaletteItem);
  _Button = _interopRequireDefault(_Button);
  _ColorPalette = _interopRequireDefault(_ColorPalette);
  _ColorPaletteStaticArea = _interopRequireDefault(_ColorPaletteStaticArea);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var ColorPalette_1;

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-color-palette</code> provides the users with a range of predefined colors. The colors are fixed and do not change with the theme.
   *
   * <h3>Usage</h3>
   *
   * The <code>ui5-color-palette</code> is meant for users that need to select a color from a predefined set.
   * To define the colors, use the <code>ui5-color-palette-item</code> component inside the default slot of the <code>ui5-color-palette</code>.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/ColorPalette.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.ColorPalette
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-color-palette
   * @since 1.0.0-rc.12
   * @appenddocs sap.ui.webc.main.ColorPaletteItem
   * @public
   */
  let ColorPalette = ColorPalette_1 = class ColorPalette extends _UI5Element.default {
    static async onDefine() {
      const colorPaletteMoreColors = (0, _FeaturesRegistry.getFeature)("ColorPaletteMoreColors");
      [ColorPalette_1.i18nBundle] = await Promise.all([(0, _i18nBundle.getI18nBundle)("@ui5/webcomponents"), colorPaletteMoreColors ? colorPaletteMoreColors.init() : Promise.resolve()]);
    }
    constructor() {
      super();
      this._itemNavigation = new _ItemNavigation.default(this, {
        getItemsCallback: () => this.displayedColors,
        rowSize: this.rowSize,
        behavior: _ItemNavigationBehavior.default.Cyclic
      });
      this._itemNavigationRecentColors = new _ItemNavigation.default(this, {
        getItemsCallback: () => this.recentColorsElements,
        rowSize: this.rowSize,
        behavior: _ItemNavigationBehavior.default.Static
      });
      this._recentColors = [];
    }
    onBeforeRendering() {
      this.displayedColors.forEach((item, index) => {
        item.index = index + 1;
      });
      if (this.showMoreColors) {
        const ColorPaletteMoreColorsClass = (0, _FeaturesRegistry.getFeature)("ColorPaletteMoreColors");
        if (ColorPaletteMoreColorsClass) {
          this.moreColorsFeature = new ColorPaletteMoreColorsClass();
        } else {
          throw new Error(`You have to import "@ui5/webcomponents/dist/features/ColorPaletteMoreColors.js" module to use the more-colors functionality.`);
        }
      }
    }
    selectColor(item) {
      if (!item.value) {
        return;
      }
      item.focus();
      if (this.displayedColors.includes(item)) {
        this._itemNavigation.setCurrentItem(item);
      }
      this._setColor(item.value);
    }
    _setColor(color) {
      this._selectedColor = color;
      if (this._recentColors[0] !== this._selectedColor) {
        if (this._recentColors.includes(this._selectedColor)) {
          this._recentColors.unshift(this._recentColors.splice(this._recentColors.indexOf(this._selectedColor), 1)[0]);
        } else {
          this._recentColors.unshift(this._selectedColor);
        }
      }
      this.fireEvent("item-click", {
        color: this._selectedColor
      });
    }
    _onclick(e) {
      const target = e.target;
      if (target.hasAttribute("ui5-color-palette-item")) {
        this.selectColor(target);
      }
    }
    _onkeyup(e) {
      const target = e.target;
      if ((0, _Keys.isSpace)(e) && target.hasAttribute("ui5-color-palette-item")) {
        e.preventDefault();
        this.selectColor(target);
      }
    }
    _onkeydown(e) {
      const target = e.target;
      if ((0, _Keys.isEnter)(e) && target.hasAttribute("ui5-color-palette-item")) {
        this.selectColor(target);
      }
    }
    _onDefaultColorKeyDown(e) {
      if ((0, _Keys.isTabNext)(e) && this.popupMode) {
        e.preventDefault();
        this._onDefaultColorClick();
      }
      if ((0, _Keys.isDown)(e)) {
        e.stopPropagation();
        this.focusColorElement(this.colorPaletteNavigationElements[1], this._itemNavigation);
      } else if ((0, _Keys.isUp)(e)) {
        e.stopPropagation();
        const lastElementInNavigation = this.colorPaletteNavigationElements[this.colorPaletteNavigationElements.length - 1];
        if (this.hasRecentColors) {
          this.focusColorElement(lastElementInNavigation, this._itemNavigationRecentColors);
        } else if (this.showMoreColors) {
          lastElementInNavigation.focus();
        } else {
          const colorPaletteFocusIndex = this.displayedColors.length % this.rowSize * this.rowSize;
          this.focusColorElement(this.displayedColors[colorPaletteFocusIndex], this._itemNavigation);
        }
      }
    }
    _onMoreColorsKeyDown(e) {
      const target = e.target;
      const index = this.colorPaletteNavigationElements.indexOf(target);
      const colorPaletteFocusIndex = this.displayedColors.length % this.rowSize * this.rowSize;
      if ((0, _Keys.isUp)(e)) {
        e.stopPropagation();
        this.focusColorElement(this.displayedColors[colorPaletteFocusIndex], this._itemNavigation);
      } else if ((0, _Keys.isDown)(e)) {
        e.stopPropagation();
        if (this.hasRecentColors) {
          this.focusColorElement(this.colorPaletteNavigationElements[index + 1], this._itemNavigationRecentColors);
        } else if (this.showDefaultColor) {
          this.colorPaletteNavigationElements[0].focus();
        } else {
          this.focusColorElement(this.displayedColors[0], this._itemNavigation);
        }
      }
    }
    _onColorContainerKeyDown(e) {
      const target = e.target;
      const lastElementInNavigation = this.colorPaletteNavigationElements[this.colorPaletteNavigationElements.length - 1];
      if ((0, _Keys.isTabNext)(e) && this.popupMode) {
        e.preventDefault();
        this.selectColor(target);
      }
      if ((0, _Keys.isUp)(e) && target === this.displayedColors[0] && this.colorPaletteNavigationElements.length > 1) {
        e.stopPropagation();
        if (this.showDefaultColor) {
          this.colorPaletteNavigationElements[0].focus();
        } else if (!this.showDefaultColor && this.hasRecentColors) {
          this.focusColorElement(lastElementInNavigation, this._itemNavigationRecentColors);
        } else if (!this.showDefaultColor && this.showMoreColors) {
          lastElementInNavigation.focus();
        }
      } else if ((0, _Keys.isDown)(e) && target === this.displayedColors[this.displayedColors.length - 1] && this.colorPaletteNavigationElements.length > 1) {
        e.stopPropagation();
        const isRecentColorsNextElement = this.showDefaultColor && !this.showMoreColors && this.hasRecentColors || !this.showDefaultColor && !this.showMoreColors && this.hasRecentColors;
        if (this.showDefaultColor && this.showMoreColors) {
          this.colorPaletteNavigationElements[2].focus();
        } else if (this.showDefaultColor && !this.showMoreColors && (!this.showRecentColors || !this.recentColors[0])) {
          this.colorPaletteNavigationElements[0].focus();
        } else if (isRecentColorsNextElement) {
          this.focusColorElement(lastElementInNavigation, this._itemNavigationRecentColors);
        } else if (!this.showDefaultColor && this.showMoreColors) {
          this.colorPaletteNavigationElements[1].focus();
        }
      }
    }
    _onRecentColorsContainerKeyDown(e) {
      if ((0, _Keys.isUp)(e)) {
        if (this.showMoreColors) {
          const navigationElementsIndex = this.showDefaultColor ? 2 : 1;
          this.colorPaletteNavigationElements[navigationElementsIndex].focus();
        } else if (!this.showMoreColors && this.colorPaletteNavigationElements.length > 1) {
          const colorPaletteFocusIndex = this.displayedColors.length % this.rowSize * this.rowSize;
          e.stopPropagation();
          this.focusColorElement(this.displayedColors[colorPaletteFocusIndex], this._itemNavigation);
        }
      } else if ((0, _Keys.isDown)(e)) {
        if (this.showDefaultColor) {
          this.colorPaletteNavigationElements[0].focus();
        } else {
          e.stopPropagation();
          this.focusColorElement(this.displayedColors[0], this._itemNavigation);
        }
      }
    }
    focusColorElement(element, itemNavigation) {
      itemNavigation.setCurrentItem(element);
      itemNavigation._focusCurrentItem();
    }
    async _chooseCustomColor() {
      const colorPicker = await this.getColorPicker();
      this._setColor(colorPicker.color);
      this._closeDialog();
    }
    async _closeDialog() {
      const dialog = await this._getDialog();
      dialog.close();
    }
    async _openMoreColorsDialog() {
      const dialog = await this._getDialog();
      dialog.show();
    }
    _onDefaultColorClick() {
      if (this.defaultColor) {
        this._setColor(this.defaultColor);
      }
    }
    /**
     * Returns the selected color.
     */
    get selectedColor() {
      return this._selectedColor;
    }
    get displayedColors() {
      const colors = this.getSlottedNodes("colors");
      return colors.filter(item => item.value).slice(0, 15);
    }
    get colorContainerLabel() {
      return ColorPalette_1.i18nBundle.getText(_i18nDefaults.COLORPALETTE_CONTAINER_LABEL);
    }
    get colorPaleteMoreColorsText() {
      return ColorPalette_1.i18nBundle.getText(_i18nDefaults.COLOR_PALETTE_MORE_COLORS_TEXT);
    }
    get _showMoreColors() {
      return this.showMoreColors && this.moreColorsFeature;
    }
    get rowSize() {
      return 5;
    }
    get hasRecentColors() {
      return this.showRecentColors && this.recentColors[0];
    }
    get recentColors() {
      if (this._recentColors.length > this.rowSize) {
        this._recentColors = this._recentColors.slice(0, this.rowSize);
      }
      while (this._recentColors.length < this.rowSize) {
        this._recentColors.push("");
      }
      return this._recentColors;
    }
    get recentColorsElements() {
      const domRef = this.getDomRef();
      if (domRef) {
        return Array.from(domRef.querySelectorAll(".ui5-cp-recent-colors-wrapper [ui5-color-palette-item]")).filter(x => x.value !== "");
      }
      return [];
    }
    get colorPaletteNavigationElements() {
      const navigationElements = [];
      const rootElement = this.shadowRoot.querySelector(".ui5-cp-root");
      if (this.showDefaultColor) {
        navigationElements.push(rootElement.querySelector(".ui5-cp-default-color-button"));
      }
      navigationElements.push(this.displayedColors[0]);
      if (this.showMoreColors) {
        navigationElements.push(rootElement.querySelector(".ui5-cp-more-colors"));
      }
      if (this.showRecentColors && !!this.recentColorsElements.length) {
        navigationElements.push(this.recentColorsElements[0]);
      }
      return navigationElements;
    }
    get classes() {
      return {
        colorPaletteRoot: {
          "ui5-cp-root": true,
          "ui5-cp-root-phone": (0, _Device.isPhone)()
        }
      };
    }
    async _getDialog() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-dialog]");
    }
    async getColorPicker() {
      const dialog = await this._getDialog();
      return dialog.content[0].querySelector("[ui5-color-picker]");
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], ColorPalette.prototype, "showRecentColors", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ColorPalette.prototype, "showMoreColors", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ColorPalette.prototype, "showDefaultColor", void 0);
  __decorate([(0, _property.default)({
    validator: _CSSColor.default
  })], ColorPalette.prototype, "defaultColor", void 0);
  __decorate([(0, _property.default)({
    validator: _CSSColor.default
  })], ColorPalette.prototype, "_selectedColor", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ColorPalette.prototype, "popupMode", void 0);
  __decorate([(0, _slot.default)({
    "default": true,
    type: HTMLElement,
    invalidateOnChildChange: true,
    individualSlots: true
  })], ColorPalette.prototype, "colors", void 0);
  ColorPalette = ColorPalette_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-color-palette",
    renderer: _LitRenderer.default,
    template: _ColorPaletteTemplate.default,
    staticAreaTemplate: _ColorPaletteDialogTemplate.default,
    styles: _ColorPalette.default,
    staticAreaStyles: _ColorPaletteStaticArea.default,
    get dependencies() {
      const colorPaletteMoreColors = (0, _FeaturesRegistry.getFeature)("ColorPaletteMoreColors");
      return [_ColorPaletteItem.default, _Button.default].concat(colorPaletteMoreColors ? colorPaletteMoreColors.dependencies : []);
    }
  })
  /**
   * Fired when the user selects a color.
   *
   * @event sap.ui.webc.main.ColorPalette#item-click
   * @public
   * @since 1.0.0-rc.15
   * @param {string} color the selected color
   */, (0, _event.default)("item-click", {
    detail: {
      color: {
        type: String
      }
    }
  })], ColorPalette);
  ColorPalette.define();
  var _default = ColorPalette;
  _exports.default = _default;
});