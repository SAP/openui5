sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer"], function (_exports, _LitRenderer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* eslint no-unused-vars: 0 */

  function block0(context, tags, suffix) {
    return (0, _LitRenderer.html)`<div class="${(0, _LitRenderer.classMap)(this.classes.root)}" tabindex="-1" @keydown=${this._onkeydown} @focusin="${this._onfocusin}" @focusout="${this._onfocusout}">${this._hasHoursSlider ? block1.call(this, context, tags, suffix) : undefined}${this._hasMinutesSlider ? block2.call(this, context, tags, suffix) : undefined}${this._hasSecondsSlider ? block3.call(this, context, tags, suffix) : undefined}${this._hasPeriodsSlider ? block4.call(this, context, tags, suffix) : undefined}</div>`;
  }
  function block1(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-wheelslider", tags, suffix)} label = "${(0, _LitRenderer.ifDefined)(this.hoursSliderTitle)}" ._items="${(0, _LitRenderer.ifDefined)(this.hoursArray)}" data-sap-focus-ref ?expanded="${this._hoursSliderFocused}" value="${(0, _LitRenderer.ifDefined)(this._hours)}" @ui5-select="${(0, _LitRenderer.ifDefined)(this.onHoursChange)}" @click="${this.selectSlider}" @focusin="${this.selectSlider}" data-sap-slider="hours" cyclic></${(0, _LitRenderer.scopeTag)("ui5-wheelslider", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-wheelslider label = "${(0, _LitRenderer.ifDefined)(this.hoursSliderTitle)}" ._items="${(0, _LitRenderer.ifDefined)(this.hoursArray)}" data-sap-focus-ref ?expanded="${this._hoursSliderFocused}" value="${(0, _LitRenderer.ifDefined)(this._hours)}" @ui5-select="${(0, _LitRenderer.ifDefined)(this.onHoursChange)}" @click="${this.selectSlider}" @focusin="${this.selectSlider}" data-sap-slider="hours" cyclic></ui5-wheelslider>`;
  }
  function block2(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-wheelslider", tags, suffix)} label = "${(0, _LitRenderer.ifDefined)(this.minutesSliderTitle)}" ._items="${(0, _LitRenderer.ifDefined)(this.minutesArray)}" ?expanded="${this._minutesSliderFocused}" value="${(0, _LitRenderer.ifDefined)(this._minutes)}" @ui5-select="${(0, _LitRenderer.ifDefined)(this.onMinutesChange)}" @click="${this.selectSlider}" @focusin="${this.selectSlider}" data-sap-slider="minutes" cyclic></${(0, _LitRenderer.scopeTag)("ui5-wheelslider", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-wheelslider label = "${(0, _LitRenderer.ifDefined)(this.minutesSliderTitle)}" ._items="${(0, _LitRenderer.ifDefined)(this.minutesArray)}" ?expanded="${this._minutesSliderFocused}" value="${(0, _LitRenderer.ifDefined)(this._minutes)}" @ui5-select="${(0, _LitRenderer.ifDefined)(this.onMinutesChange)}" @click="${this.selectSlider}" @focusin="${this.selectSlider}" data-sap-slider="minutes" cyclic></ui5-wheelslider>`;
  }
  function block3(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-wheelslider", tags, suffix)} label = "${(0, _LitRenderer.ifDefined)(this.secondsSliderTitle)}" ._items="${(0, _LitRenderer.ifDefined)(this.secondsArray)}" ?expanded="${this._secondsSliderFocused}" value="${(0, _LitRenderer.ifDefined)(this._seconds)}" @ui5-select="${(0, _LitRenderer.ifDefined)(this.onSecondsChange)}" @click="${this.selectSlider}" @focusin="${this.selectSlider}" data-sap-slider="seconds" cyclic></${(0, _LitRenderer.scopeTag)("ui5-wheelslider", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-wheelslider label = "${(0, _LitRenderer.ifDefined)(this.secondsSliderTitle)}" ._items="${(0, _LitRenderer.ifDefined)(this.secondsArray)}" ?expanded="${this._secondsSliderFocused}" value="${(0, _LitRenderer.ifDefined)(this._seconds)}" @ui5-select="${(0, _LitRenderer.ifDefined)(this.onSecondsChange)}" @click="${this.selectSlider}" @focusin="${this.selectSlider}" data-sap-slider="seconds" cyclic></ui5-wheelslider>`;
  }
  function block4(context, tags, suffix) {
    return suffix ? (0, _LitRenderer.html)`<${(0, _LitRenderer.scopeTag)("ui5-wheelslider", tags, suffix)} label = "${(0, _LitRenderer.ifDefined)(this.periodSliderTitle)}" ._items="${(0, _LitRenderer.ifDefined)(this.periodsArray)}" ?expanded="${this._periodSliderFocused}" value="${(0, _LitRenderer.ifDefined)(this._period)}" @ui5-select="${(0, _LitRenderer.ifDefined)(this.onPeriodChange)}" @click="${this.selectSlider}" @focusin="${this.selectSlider}" data-sap-slider="periods"></${(0, _LitRenderer.scopeTag)("ui5-wheelslider", tags, suffix)}>` : (0, _LitRenderer.html)`<ui5-wheelslider label = "${(0, _LitRenderer.ifDefined)(this.periodSliderTitle)}" ._items="${(0, _LitRenderer.ifDefined)(this.periodsArray)}" ?expanded="${this._periodSliderFocused}" value="${(0, _LitRenderer.ifDefined)(this._period)}" @ui5-select="${(0, _LitRenderer.ifDefined)(this.onPeriodChange)}" @click="${this.selectSlider}" @focusin="${this.selectSlider}" data-sap-slider="periods"></ui5-wheelslider>`;
  }
  var _default = block0;
  _exports.default = _default;
});