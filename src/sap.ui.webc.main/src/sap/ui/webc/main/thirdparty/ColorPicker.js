sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/types/CSSColor', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/Render', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/types/Float', 'sap/ui/webc/common/thirdparty/base/util/ColorConversion', './generated/templates/ColorPickerTemplate.lit', './Input', './Slider', './Label', './generated/themes/ColorPicker.css'], function (UI5Element, CSSColor, Device, Render, litRender, Integer, Float, ColorConversion, ColorPickerTemplate_lit, Input, Slider, Label, ColorPicker_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var CSSColor__default = /*#__PURE__*/_interopDefaultLegacy(CSSColor);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var Float__default = /*#__PURE__*/_interopDefaultLegacy(Float);

	const metadata = {
		tag: "ui5-color-picker",
		properties:  {
			color: {
				type: CSSColor__default,
				defaultValue: "rgba(255, 255, 255, 1)",
			},
			hex: {
				type: String,
				defaultValue: "ffffff",
				noAttribute: true,
			},
			_mainColor: {
				type: Object,
			},
			_color: {
				type: Object,
			},
			_selectedCoordinates: {
				type: Object,
			},
			_alpha: {
				type: Float__default,
				defaultValue: 1,
			},
			_hue: {
				type: Integer__default,
				defaultValue: 0,
			},
			_wrongHEX: {
				type: Boolean,
			},
		},
		slots:  {
		},
		events:  {
			change: {},
		},
	};
	class ColorPicker extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return ColorPicker_css;
		}
		static get template() {
			return ColorPickerTemplate_lit;
		}
		static get dependencies() {
			return [
				Input,
				Slider,
				Label,
			];
		}
		constructor() {
			super();
			this._selectedCoordinates = {
				x: 256 - 6.5,
				y: 256 - 6.5,
			};
			this._mainColor = {
				r: 255,
				g: 0,
				b: 0,
			};
			this.selectedHue = 0;
			this.mouseDown = false;
		}
		onBeforeRendering() {
			this._color = ColorConversion.getRGBColor(this.color);
			this._setHex();
			this._setValues();
			this.style.setProperty("--ui5_Color_Picker_Progress_Container_Color", this.color);
		}
		async onAfterRendering() {
			if (Device.isIE()) {
				await Render.renderFinished();
				this._applySliderStyles();
			}
		}
		_applySliderStyles() {
			const hueSlider = this.getDomRef().querySelector(".ui5-color-picker-hue-slider").shadowRoot,
				alphaSlider = this.getDomRef().querySelector(".ui5-color-picker-alpha-slider").shadowRoot;
			if (hueSlider.children.length === 0 || alphaSlider.children.length === 0) {
				return;
			}
			const hueProgressSlider = hueSlider.querySelector(".ui5-slider-progress-container"),
				hueHandle = hueSlider.querySelector(".ui5-slider-handle"),
				alphaProgressSlider = alphaSlider.querySelector(".ui5-slider-progress-container"),
				alphaHandle = alphaSlider.querySelector(".ui5-slider-handle");
			hueHandle.style.width = "11px";
			hueHandle.style.height = "1.25rem";
			hueHandle.style.background = "transparent";
			hueHandle.style.marginLeft = "-2px";
			hueHandle.style.marginTop = "1px";
			alphaHandle.style.width = "11px";
			alphaHandle.style.height = "1.25rem";
			alphaHandle.style.background = "transparent";
			alphaHandle.style.marginLeft = "-2px";
			alphaHandle.style.marginTop = "1px";
			hueProgressSlider.style.width = "calc(100% + 11px)";
			hueProgressSlider.style.height = "18px";
			hueProgressSlider.style.position = "absolute";
			hueProgressSlider.style.marginTop = "-10px";
			hueProgressSlider.style.borderRadius = "0";
			hueProgressSlider.style.border = "1px solid #89919a";
			alphaProgressSlider.style.width = "calc(100% + 11px)";
			alphaProgressSlider.style.height = "18px";
			alphaProgressSlider.style.position = "absolute";
			alphaProgressSlider.style.marginTop = "-10px";
			alphaProgressSlider.style.borderRadius = "0";
			alphaProgressSlider.style.border = "1px solid #89919a";
			hueProgressSlider.style.backgroundSize = "100%";
			hueProgressSlider.style.backgroundImage = "-webkit-linear-gradient(left, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";
			hueProgressSlider.style.backgroundImage = "-moz-linear-gradient(left, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";
			hueProgressSlider.style.backgroundImage = "-ms-linear-gradient(left, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";
			hueProgressSlider.style.backgroundImage = "linear-gradient(left, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";
			hueProgressSlider.style.backgroundColor = "none";
			alphaProgressSlider.style.backgroundImage = "-webkit-linear-gradient(left, #fff, #979797)";
			alphaProgressSlider.style.backgroundImage = "-moz-linear-gradient(left, #fff, #979797)";
			alphaProgressSlider.style.backgroundImage = "-ms-linear-gradient(left, #fff, #979797)";
			alphaProgressSlider.style.backgroundImage = "linear-gradient(left, #fff, #979797)";
			alphaProgressSlider.style.backgroundColor = "none";
			hueSlider.querySelector(".ui5-slider-progress").style.background = "Transparent";
			alphaSlider.querySelector(".ui5-slider-progress").style.background = "Transparent";
		}
		_handleMouseDown(event) {
			this.mouseDown = true;
			this.mouseIn = true;
			this._changeSelectedColor(event.offsetX, event.offsetY);
		}
		_handleMouseUp() {
			this.mouseDown = false;
		}
		_handleMouseOut(event) {
			if (!this.mouseIn || !this.mouseDown) {
				return;
			}
			const isLeft = event.offsetX <= 0;
			const isUp = event.offsetY <= 0;
			const isDown = event.offsetY >= event.target.offsetHeight;
			const isRight = event.offsetX >= event.target.offsetWidth;
			let x,
				y;
			if (isLeft) {
				x = 0;
			} else if (isRight) {
				x = event.offsetWidth;
			} else {
				x = event.offsetX;
			}
			if (isUp) {
				y = 0;
			} else if (isDown) {
				y = event.offsetHeight;
			} else {
				y = event.offsetY;
			}
			this._changeSelectedColor(x, y);
			this.mouseIn = false;
			this.mouseDown = false;
		}
		_handleMouseMove(event) {
			if (!this.mouseDown || !this.mouseIn) {
				return;
			}
			this._changeSelectedColor(event.offsetX, event.offsetY);
		}
		_handleAlphaInput(event) {
			this._alpha = parseFloat(event.target.value);
		}
		_handleHueInput(event) {
			this.selectedHue = event.target.value;
			this._setMainColor(this._hue);
		}
		_handleHEXChange(event) {
			let newValue = event.target.value.toLowerCase();
			const hexRegex = new RegExp("^[<0-9 abcdef]+$");
			if (newValue.length === 3) {
				newValue = `${newValue[0]}${newValue[0]}${newValue[1]}${newValue[1]}${newValue[2]}${newValue[2]}`;
			}
			this.hex = newValue;
			if (newValue.length !== 6 || !hexRegex.test(newValue)) {
				this._wrongHEX = true;
			} else {
				this._wrongHEX = false;
				this._setColor(ColorConversion.HEXToRGB(this.hex));
			}
		}
		_handleRGBInputsChange(event) {
			const targetValue = parseInt(event.target.value) || 0;
			let tempColor;
			switch (event.target.id) {
			case "red":
				tempColor = { ...this._color, r: targetValue };
				break;
			case "green":
				tempColor = { ...this._color, g: targetValue };
				break;
			case "blue":
				tempColor = { ...this._color, b: targetValue };
				break;
			}
			this._setColor(tempColor);
		}
		_setMainColor(hueValue) {
			if (hueValue <= 255) {
				this._mainColor = {
					r: 255,
					g: hueValue,
					b: 0,
				};
			} else if (hueValue <= 510) {
				this._mainColor = {
					r: 255 - (hueValue - 255),
					g: 255,
					b: 0,
				};
			} else if (hueValue <= 765) {
				this._mainColor = {
					r: 0,
					g: 255,
					b: hueValue - 510,
				};
			} else if (hueValue <= 1020) {
				this._mainColor = {
					r: 0,
					g: 765 - (hueValue - 255),
					b: 255,
				};
			} else if (hueValue <= 1275) {
				this._mainColor = {
					r: hueValue - 1020,
					g: 0,
					b: 255,
				};
			} else {
				this._mainColor = {
					r: 255,
					g: 0,
					b: 1275 - (hueValue - 255),
				};
			}
		}
		_handleAlphaChange(event) {
			this._alpha = this._alpha < 0 ? 0 : this._alpha;
			this._alpha = this._alpha > 1 ? 1 : this._alpha;
		}
		_changeSelectedColor(x, y) {
			this._selectedCoordinates = {
				x: x - 6.5,
				y: y - 6.5,
			};
			const tempColor = this._calculateColorFromCoordinates(x, y);
			if (tempColor) {
				this._setColor(ColorConversion.HSLToRGB(tempColor));
			}
		}
		_calculateColorFromCoordinates(x, y) {
			const h = Math.round(this._hue / 4.25),
				s = 1 - +(Math.round((y / 256) + "e+2") + "e-2"),
				l = +(Math.round((x / 256) + "e+2") + "e-2");
			if (!s || !l) {
				return;
			}
			return {
				h,
				s,
				l,
			};
		}
		_setColor(color = {
			r: undefined,
			g: undefined,
			b: undefined,
		}) {
			this.color = `rgba(${color.r}, ${color.g}, ${color.b}, ${this._alpha})`;
			this.fireEvent("change");
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
			const hslColours = ColorConversion.RGBToHSL(this._color);
			this._selectedCoordinates = {
				x: ((Math.round(hslColours.l * 100) * 2.56)) - 6.5,
				y: (256 - (Math.round(hslColours.s * 100) * 2.56)) - 6.5,
			};
			this._hue = this.selectedHue ? this.selectedHue : Math.round(hslColours.h * 4.25);
			this._setMainColor(this._hue);
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
					"background-color": `rgb(${this._mainColor.r}, ${this._mainColor.g}, ${this._mainColor.b})`,
				},
				circle: {
					left: `${this._selectedCoordinates.x}px`,
					top: `${this._selectedCoordinates.y}px`,
				},
				progressContainer: {
					"background-image": `-webkit-linear-gradient(left, rgba(65, 120, 13, 0), ${this._mainColor}, url('data:image/png;base64,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')`,
				},
				colorSpan: {
					"background-color": `rgba(${this._color.r}, ${this._color.g}, ${this._color.b}, ${this._alpha})`,
				},
			};
		}
	}
	ColorPicker.define();

	return ColorPicker;

});
