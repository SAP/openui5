sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/CSSColor", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/Float", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/CustomElementsScope", "sap/ui/webc/common/thirdparty/base/util/ColorConversion", "./generated/templates/ColorPickerTemplate.lit", "./Input", "./Slider", "./Label", "./generated/i18n/i18n-defaults", "./generated/themes/ColorPicker.css"], function (_exports, _UI5Element, _customElement, _property, _event, _Keys, _CSSColor, _LitRenderer, _Integer, _Float, _i18nBundle, _CustomElementsScope, _ColorConversion, _ColorPickerTemplate, _Input, _Slider, _Label, _i18nDefaults, _ColorPicker) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _CSSColor = _interopRequireDefault(_CSSColor);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Integer = _interopRequireDefault(_Integer);
  _Float = _interopRequireDefault(_Float);
  _ColorPickerTemplate = _interopRequireDefault(_ColorPickerTemplate);
  _Input = _interopRequireDefault(_Input);
  _Slider = _interopRequireDefault(_Slider);
  _Label = _interopRequireDefault(_Label);
  _ColorPicker = _interopRequireDefault(_ColorPicker);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var ColorPicker_1;

  // Styles

  const PICKER_POINTER_WIDTH = 6.5;
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-color-picker</code> allows users to choose any color and provides different input options for selecting colors.
   *
   * <h3>Usage</h3>
   *
   * <h4>When to use:</h4
   * Use the color picker if:
   * <ul>
   * <li> users need to select any color freely.</li>
   * </ul>
   *
   * <h4>When not to use:</h4>
   * <ul>
   * <li> Users need to select one color from a predefined set of colors. Use the ColorPalette component instead.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/ColorPicker.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @since 1.0.0-rc.12
   * @alias sap.ui.webc.main.ColorPicker
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-color-picker
   * @public
   */
  let ColorPicker = ColorPicker_1 = class ColorPicker extends _UI5Element.default {
    static async onDefine() {
      ColorPicker_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
      // Bottom Right corner
      this._selectedCoordinates = {
        x: 256 - PICKER_POINTER_WIDTH,
        y: 256 - PICKER_POINTER_WIDTH
      };
      // Default main color is red
      this._mainColor = {
        r: 255,
        g: 0,
        b: 0
      };
      this.selectedHue = 0;
      this.mouseDown = false;
      this.mouseIn = false;
    }
    onBeforeRendering() {
      // we have the color & _mainColor properties here
      this._color = (0, _ColorConversion.getRGBColor)(this.color);
      const tempColor = `rgba(${this._color.r}, ${this._color.g}, ${this._color.b}, 1)`;
      this._setHex();
      this._setValues();
      this.style.setProperty((0, _CustomElementsScope.getScopedVarName)("--ui5_Color_Picker_Progress_Container_Color"), tempColor);
    }
    _handleMouseDown(e) {
      this.mouseDown = true;
      this.mouseIn = true;
      this._changeSelectedColor(e.offsetX, e.offsetY);
    }
    _handleMouseUp() {
      this.mouseDown = false;
    }
    _handleMouseOut(e) {
      if (!this.mouseIn || !this.mouseDown) {
        return;
      }
      const target = e.target;
      const offsetHeight = target.offsetHeight;
      const offsetWidth = target.offsetWidth;
      const isLeft = e.offsetX <= 0;
      const isUp = e.offsetY <= 0;
      const isDown = e.offsetY >= target.offsetHeight;
      const isRight = e.offsetX >= target.offsetWidth;
      let x, y;
      if (isLeft) {
        x = 0;
      } else if (isRight) {
        // Note: - e.offsetWidth has been changed to e.target.offsetWidth as offsetWidth does not exist on the event object
        x = offsetWidth;
      } else {
        x = e.offsetX;
      }
      if (isUp) {
        y = 0;
      } else if (isDown) {
        // Note: - e.offsetWidth has been changed to e.target.offsetWidth as offsetWidth does not exist on the event object
        y = offsetHeight;
      } else {
        y = e.offsetY;
      }
      this._changeSelectedColor(x, y);
      this.mouseIn = false;
      this.mouseDown = false;
    }
    _handleMouseMove(e) {
      if (!this.mouseDown || !this.mouseIn) {
        return;
      }
      this._changeSelectedColor(e.offsetX, e.offsetY);
    }
    _handleAlphaInput(e) {
      const aphaInputValue = e.target.value;
      this._alpha = parseFloat(aphaInputValue);
      this._setColor(this._color);
    }
    _handleHueInput(e) {
      this.selectedHue = e.target.value;
      this._hue = this.selectedHue;
      this._setMainColor(this._hue);
      // Idication that changes to the hue value triggered as a result of user pressing over the hue slider.
      this._isHueValueChanged = true;
      const x = this._selectedCoordinates.x + PICKER_POINTER_WIDTH;
      const y = this._selectedCoordinates.y + PICKER_POINTER_WIDTH;
      const tempColor = this._calculateColorFromCoordinates(x, y);
      if (tempColor) {
        this._setColor((0, _ColorConversion.HSLToRGB)(tempColor));
      }
    }
    _handleHEXChange(e) {
      const hexRegex = new RegExp("^[<0-9 abcdef]+$");
      const input = e.target;
      let inputValueLowerCase = input.value.toLowerCase();
      // Shorthand Syntax
      if (inputValueLowerCase.length === 3) {
        inputValueLowerCase = `${inputValueLowerCase[0]}${inputValueLowerCase[0]}${inputValueLowerCase[1]}${inputValueLowerCase[1]}${inputValueLowerCase[2]}${inputValueLowerCase[2]}`;
      }
      const isNewValueValid = inputValueLowerCase.length === 6 && hexRegex.test(inputValueLowerCase);
      if (isNewValueValid && input.value !== inputValueLowerCase) {
        this._wrongHEX = false;
        input.value = inputValueLowerCase;
      }
      if (inputValueLowerCase === this.hex) {
        return;
      }
      this.hex = inputValueLowerCase;
      if (!isNewValueValid) {
        this._wrongHEX = true;
      } else {
        this._wrongHEX = false;
        this._setColor((0, _ColorConversion.HEXToRGB)(this.hex));
      }
    }
    _handleRGBInputsChange(e) {
      const target = e.target;
      const targetValue = parseInt(target.value) || 0;
      let tempColor;
      switch (target.id) {
        case "red":
          tempColor = {
            ...this._color,
            r: targetValue
          };
          break;
        case "green":
          tempColor = {
            ...this._color,
            g: targetValue
          };
          break;
        case "blue":
          tempColor = {
            ...this._color,
            b: targetValue
          };
          break;
        default:
          tempColor = {
            ...this._color
          };
      }
      this._setColor(tempColor);
    }
    _setMainColor(hueValue) {
      if (hueValue <= 255) {
        this._mainColor = {
          r: 255,
          g: hueValue,
          b: 0
        };
      } else if (hueValue <= 510) {
        this._mainColor = {
          r: 255 - (hueValue - 255),
          g: 255,
          b: 0
        };
      } else if (hueValue <= 765) {
        this._mainColor = {
          r: 0,
          g: 255,
          b: hueValue - 510
        };
      } else if (hueValue <= 1020) {
        this._mainColor = {
          r: 0,
          g: 765 - (hueValue - 255),
          b: 255
        };
      } else if (hueValue <= 1275) {
        this._mainColor = {
          r: hueValue - 1020,
          g: 0,
          b: 255
        };
      } else {
        this._mainColor = {
          r: 255,
          g: 0,
          b: 1275 - (hueValue - 255)
        };
      }
    }
    _handleAlphaChange() {
      this._alpha = this._alpha < 0 ? 0 : this._alpha;
      this._alpha = this._alpha > 1 ? 1 : this._alpha;
    }
    _changeSelectedColor(x, y) {
      this._selectedCoordinates = {
        x: x - PICKER_POINTER_WIDTH,
        y: y - PICKER_POINTER_WIDTH // Center the coordinates, because of the height of the circle
      };
      // Idication that changes to the color settings are triggered as a result of user pressing over the main color section.
      this._isSelectedColorChanged = true;
      const tempColor = this._calculateColorFromCoordinates(x, y);
      if (tempColor) {
        this._setColor((0, _ColorConversion.HSLToRGB)(tempColor));
      }
    }
    _onkeydown(e) {
      if ((0, _Keys.isEnter)(e)) {
        this._handleHEXChange(e);
      }
    }
    _calculateColorFromCoordinates(x, y) {
      // By using the selected coordinates(x = Lightness, y = Saturation) and hue(selected from the hue slider)
      // and HSL format, the color will be parsed to RGB
      // 0 ≤ H < 360
      const h = this._hue / 4.25;
      // 0 ≤ S ≤ 1
      const s = 1 - +(Math.round(parseFloat(y / 256 + "e+2")) + "e-2"); // eslint-disable-line
      // 0 ≤ V ≤ 1
      const l = +(Math.round(parseFloat(x / 256 + "e+2")) + "e-2"); // eslint-disable-line
      if (!s || !l) {
        // The event is finished out of the main color section
        return;
      }
      return {
        h,
        s,
        l
      };
    }
    _setColor(color = {
      r: 0,
      g: 0,
      b: 0
    }) {
      this.color = `rgba(${color.r}, ${color.g}, ${color.b}, ${this._alpha})`;
      this._wrongHEX = !this.isValidRGBColor(color);
      this.fireEvent("change");
    }
    isValidRGBColor(color) {
      return color.r >= 0 && color.r <= 255 && color.g >= 0 && color.g <= 255 && color.b >= 0 && color.b <= 255;
    }
    _setHex() {
      let red = this._color.r.toString(16),
        green = this._color.g.toString(16),
        blue = this._color.b.toString(16);
      if (red.length === 1) {
        red = `0${red}`;
      }
      if (green.length === 1) {
        green = `0${green}`;
      }
      if (blue.length === 1) {
        blue = `0${blue}`;
      }
      this.hex = red + green + blue;
    }
    _setValues() {
      const hslColours = (0, _ColorConversion.RGBToHSL)(this._color);
      this._selectedCoordinates = {
        x: Math.round(hslColours.l * 100) * 2.56 - PICKER_POINTER_WIDTH,
        y: 256 - Math.round(hslColours.s * 100) * 2.56 - PICKER_POINTER_WIDTH // Center the coordinates, because of the height of the circle
      };

      if (this._isSelectedColorChanged) {
        // We shouldn't update the hue value when user presses over the main color section.
        this._isSelectedColorChanged = false;
      } else if (this._isHueValueChanged) {
        // We shouldn't recalculate the hue value when user changes the hue slider.
        this._isHueValueChanged = false;
        this._hue = this.selectedHue ? this.selectedHue : this._hue;
      } else {
        this._hue = Math.round(hslColours.h * 4.25);
      }
      this._setMainColor(this._hue);
    }
    get hueSliderLabel() {
      return ColorPicker_1.i18nBundle.getText(_i18nDefaults.COLORPICKER_HUE_SLIDER);
    }
    get alphaSliderLabel() {
      return ColorPicker_1.i18nBundle.getText(_i18nDefaults.COLORPICKER_ALPHA_SLIDER);
    }
    get hexInputLabel() {
      return ColorPicker_1.i18nBundle.getText(_i18nDefaults.COLORPICKER_HEX);
    }
    get redInputLabel() {
      return ColorPicker_1.i18nBundle.getText(_i18nDefaults.COLORPICKER_RED);
    }
    get greenInputLabel() {
      return ColorPicker_1.i18nBundle.getText(_i18nDefaults.COLORPICKER_GREEN);
    }
    get blueInputLabel() {
      return ColorPicker_1.i18nBundle.getText(_i18nDefaults.COLORPICKER_BLUE);
    }
    get alphaInputLabel() {
      return ColorPicker_1.i18nBundle.getText(_i18nDefaults.COLORPICKER_ALPHA);
    }
    get inputsDisabled() {
      return this._wrongHEX ? true : undefined;
    }
    get hexInputErrorState() {
      return this._wrongHEX ? "Error" : undefined;
    }
    get styles() {
      return {
        mainColor: {
          "background-color": `rgb(${this._mainColor.r}, ${this._mainColor.g}, ${this._mainColor.b})`
        },
        circle: {
          left: `${this._selectedCoordinates.x}px`,
          top: `${this._selectedCoordinates.y}px`
        },
        colorSpan: {
          "background-color": `rgba(${this._color.r}, ${this._color.g}, ${this._color.b}, ${this._alpha})`
        }
      };
    }
  };
  __decorate([(0, _property.default)({
    validator: _CSSColor.default,
    defaultValue: "rgba(255, 255, 255, 1)"
  })], ColorPicker.prototype, "color", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "ffffff",
    noAttribute: true
  })], ColorPicker.prototype, "hex", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ColorPicker.prototype, "_mainColor", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ColorPicker.prototype, "_color", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ColorPicker.prototype, "_selectedCoordinates", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default,
    defaultValue: 1
  })], ColorPicker.prototype, "_alpha", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0
  })], ColorPicker.prototype, "_hue", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ColorPicker.prototype, "_isSelectedColorChanged", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ColorPicker.prototype, "_isHueValueChanged", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ColorPicker.prototype, "_wrongHEX", void 0);
  ColorPicker = ColorPicker_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-color-picker",
    renderer: _LitRenderer.default,
    styles: _ColorPicker.default,
    template: _ColorPickerTemplate.default,
    dependencies: [_Input.default, _Slider.default, _Label.default]
  })
  /**
   * Fired when the the selected color is changed
   *
   * @event sap.ui.webc.main.ColorPicker#change
   * @public
   */, (0, _event.default)("change")], ColorPicker);
  ColorPicker.define();
  var _default = ColorPicker;
  _exports.default = _default;
});