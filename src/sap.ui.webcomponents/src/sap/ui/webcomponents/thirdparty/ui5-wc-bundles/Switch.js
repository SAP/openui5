sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-1be5f319', './chunk-04be579f', './chunk-1b10f44e', './chunk-39e0e4ab'], function (__chunk_1, __chunk_2, __chunk_3, __chunk_5, __chunk_6, __chunk_7, __chunk_8, __chunk_9, __chunk_10, __chunk_15, __chunk_22) { 'use strict';

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-switch-text ui5-switch-text--on\" part=\"text-on\">", "</span><span class=\"ui5-switch-text ui5-switch-text--off\" part=\"text-off\">", "</span>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-switch-text ui5-switch-text--on\"><ui5-icon name=\"accept\" dir=\"ltr\" class=\"ui5-switch-icon-on\"></ui5-icon></span><span class=\"ui5-switch-text ui5-switch-text--off\"><ui5-icon name=\"decline\" class=\"ui5-switch-icon-off\"></ui5-icon></span>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-switch-root ", "\" role=\"checkbox\" aria-checked=\"", "\" aria-disabled=\"", "\" aria-labelledby=\"", "-hiddenText\" @click=\"", "\" @keyup=\"", "\" @keydown=\"", "\" tabindex=\"", "\" dir=\"", "\"><div class=\"ui5-switch-inner\"><div class=\"ui5-switch-track\" part=\"slider\"><div class=\"ui5-switch-slider\">", "<span class=\"ui5-switch-handle\" part=\"handle\"></span></div></div></div><input type='checkbox' ?checked=\"", "\" class=\"ui5-switch-input\" data-sap-no-tab-ref/><span id=\"", "-hiddenText\" class=\"ui5-hidden-text\">", "</span></div>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.classMap(context.classes.main), __chunk_2.ifDefined(context.checked), __chunk_2.ifDefined(context.ariaDisabled), __chunk_2.ifDefined(context._id), context._onclick, context._onkeyup, context._onkeydown, __chunk_2.ifDefined(context.tabIndex), __chunk_2.ifDefined(context.effectiveDir), context.graphical ? block1(context) : block2(context), context.checked, __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.hiddenText));
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2());
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(context._textOn), __chunk_2.ifDefined(context._textOff));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var switchCss = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:0;top:0}:host(:not([hidden])){display:inline-block}.ui5-switch-root{position:relative;width:100%;height:var(--_ui5_switch_height);min-width:var(--_ui5_switch_width);cursor:pointer;outline:none;-webkit-tap-highlight-color:rgba(0,0,0,0)}.ui5-switch-root.ui5-switch--no-label{min-width:var(--_ui5_switch_no_label_width)}.ui5-switch-inner{display:flex;align-items:center;justify-content:center;height:100%;overflow:hidden;pointer-events:none;will-change:transform}.ui5-switch-track{height:var(--_ui5_switch_track_height);width:100%;display:flex;align-items:center;background:var(--sapButton_Track_Background);border:1px solid;border-color:var(--sapContent_ForegroundBorderColor);border-radius:var(--_ui5_switch_track_border_radius);box-sizing:border-box}.ui5-switch--no-label .ui5-switch-track{height:var(--_ui5_switch_track_no_label_height)}.ui5-switch-slider{position:relative;height:var(--_ui5_switch_height);width:100%;transition:transform .1s ease-in;transform-origin:top left}.ui5-switch-handle{position:absolute;left:-1px;width:var(--_ui5_switch_handle_width);height:var(--_ui5_switch_handle_height);background:var(--_ui5_switch_handle_bg);border:var(--_ui5_switch_handle_border_width) solid var(--sapContent_ForegroundBorderColor);border-radius:var(--_ui5_switch_handle_border_radius);box-sizing:border-box}.ui5-switch-text{display:flex;justify-content:center;position:absolute;min-width:1.625rem;padding:0 .125rem;font-size:var(--sapFontSmallSize);font-family:var(--sapFontFamily);text-transform:uppercase;text-align:center;color:var(--sapTextColor);white-space:nowrap;user-select:none;-webkit-user-select:none;-ms-user-select:none}.ui5-switch-text--on{left:var(--_ui5_switch_text_on_left)}.ui5-switch-text--off{right:0}.ui5-switch-handle,.ui5-switch-text{top:50%;transform:translateY(-50%)}.ui5-switch-desktop.ui5-switch-root:focus:after{content:\"\";position:absolute;left:-var(--_ui5_switch_outline);top:0;bottom:0;width:100%;border:var(--_ui5_switch_outline) dotted var(--sapContent_FocusColor);pointer-events:none}.ui5-switch-root .ui5-switch-input{position:absolute;left:0;width:0;height:0;margin:0;visibility:hidden;-webkit-appearance:none}.ui5-switch-root.ui5-switch--disabled{opacity:.4;cursor:default}.ui5-switch-root.ui5-switch--disabled.ui5-switch--checked .ui5-switch-track{background:var(--_ui5_switch_track_disabled_checked_bg)}.ui5-switch-root.ui5-switch--disabled.ui5-switch--checked .ui5-switch-handle{background:var(--_ui5_switch_handle_disabled_checked_bg)}.ui5-switch-root.ui5-switch--disabled .ui5-switch-handle{background:var(--_ui5_switch_handle_disabled_bg)}.ui5-switch-root.ui5-switch--semantic.ui5-switch--disabled .ui5-switch-track{background:var(--_ui5_switch_track_disabled_semantic_checked_bg)}.ui5-switch-root.ui5-switch--semantic.ui5-switch--disabled .ui5-switch-handle{background:var(--_ui5_switch_handle_disabled_semantic_checked_bg)}.ui5-switch-root.ui5-switch--semantic.ui5-switch--disabled:not(.ui5-switch--checked) .ui5-switch-track{background:var(--_ui5_switch_track_disabled_semantic_bg)}.ui5-switch-root.ui5-switch--semantic.ui5-switch--disabled:not(.ui5-switch--checked) .ui5-switch-handle{background:var(--sapButton_Background)}.ui5-switch-root.ui5-switch--checked .ui5-switch-handle{background:var(--_ui5_switch_handle_checked_bg);border-color:var(--_ui5_switch_handle_checked_border_color)}.ui5-switch-root.ui5-switch--checked .ui5-switch-track{background:var(--sapButton_Track_Selected_Background)}.ui5-switch-root.ui5-switch--checked .ui5-switch-slider{transform:var(--_ui5_switch_slide_transform)}.ui5-switch-desktop.ui5-switch-root.ui5-switch--checked:not(.ui5-switch--disabled) .ui5-switch-text--on,.ui5-switch-root.ui5-switch--checked .ui5-switch-text--off{color:var(--sapButton_Track_Selected_TextColor)}.ui5-switch-root.ui5-switch--semantic .ui5-switch-handle,.ui5-switch-root.ui5-switch--semantic .ui5-switch-track{border-color:var(--sapSuccessBorderColor)}.ui5-switch-root.ui5-switch--semantic .ui5-switch-track{background:var(--sapSuccessBackground)}.ui5-switch-root.ui5-switch--semantic .ui5-switch-handle{background:var(--sapButton_Background)}.ui5-switch-root.ui5-switch--semantic .ui5-switch-text{justify-content:center;font-size:var(--sapFontSmallSize)}.ui5-switch-root.ui5-switch--semantic .ui5-switch-icon-off,.ui5-switch-root.ui5-switch--semantic .ui5-switch-icon-on{width:.75rem;height:.75rem}.ui5-switch-root.ui5-switch--semantic .ui5-switch-icon-on{color:var(--sapPositiveElementColor)}.ui5-switch-root.ui5-switch--semantic .ui5-switch-icon-off{color:var(--sapNegativeElementColor)}.ui5-switch-root.ui5-switch--semantic:not(.ui5-switch--checked) .ui5-switch-handle,.ui5-switch-root.ui5-switch--semantic:not(.ui5-switch--checked) .ui5-switch-track{border-color:var(--sapErrorBorderColor)}.ui5-switch-root.ui5-switch--semantic:not(.ui5-switch--checked) .ui5-switch-track{background:var(--sapErrorBackground)}.ui5-switch-root.ui5-switch--semantic:not(.ui5-switch--checked) .ui5-switch-handle{background:var(--sapButton_Background)}.ui5-switch-desktop.ui5-switch-root:not(.ui5-switch--disabled):hover .ui5-switch-track{border-color:var(--sapButton_Hover_BorderColor);background:var(--sapButton_Track_Background)}.ui5-switch-desktop.ui5-switch-root:not(.ui5-switch--disabled):hover .ui5-switch-handle{background:var(--sapButton_Hover_Background);border-color:var(--sapButton_Hover_BorderColor)}.ui5-switch-desktop.ui5-switch-root.ui5-switch--checked:not(.ui5-switch--disabled):hover .ui5-switch-handle{background:var(--sapButton_Selected_Hover_Background);border-color:var(--sapButton_Hover_BorderColor)}.ui5-switch-desktop.ui5-switch-root.ui5-switch--checked:not(.ui5-switch--disabled):hover .ui5-switch-track{border-color:var(--sapButton_Hover_BorderColor);background:var(--_ui5_switch_track_hover_checked_background_color)}.ui5-switch-desktop.ui5-switch-root.ui5-switch--semantic:not(.ui5-switch--disabled):hover .ui5-switch-handle{background:var(--_ui5_switch_handle_semantic_hover_bg);border-color:var(--_ui5_switch_handle_semantic_hover_border_color)}.ui5-switch-desktop.ui5-switch-root.ui5-switch--semantic:not(.ui5-switch--disabled):hover .ui5-switch-track{border-color:var(--_ui5_switch_handle_semantic_hover_border_color)}.ui5-switch-desktop.ui5-switch-root.ui5-switch--semantic.ui5-switch--checked:not(.ui5-switch--disabled):hover .ui5-switch-handle{background:var(--_ui5_switch_handle_semantic_checked_hover_bg);border-color:var(--_ui5_switch_handle_semantic_checked_hover_border_color)}.ui5-switch-desktop.ui5-switch-root.ui5-switch--semantic.ui5-switch--checked:not(.ui5-switch--disabled):hover .ui5-switch-track{border-color:var(--_ui5_switch_handle_semantic_checked_hover_border_color)}.ui5-switch-root.ui5-switch--semantic.ui5-switch--disabled .ui5-switch-icon--on,.ui5-switch-root.ui5-switch--semantic:hover .ui5-switch-icon--on{color:var(--_ui5_switch_text_on_semantic_color)}.ui5-switch-root.ui5-switch--semantic.ui5-switch--disabled .ui5-switch-icon--off,.ui5-switch-root.ui5-switch--semantic:hover .ui5-switch-icon--off{color:var(--_ui5_switch_text_off_semantic_color)}[dir=rtl].ui5-switch-root .ui5-switch-handle{left:0;right:-1px}[dir=rtl].ui5-switch-root.ui5-switch--checked .ui5-switch-slider{transform:var(--_ui5_switch_rtl_transform)}[dir=rtl].ui5-switch-root .ui5-switch-text--on{right:var(--_ui5_switch_text_right);left:auto}[dir=rtl].ui5-switch-root .ui5-switch-text--off{right:auto;left:0}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-switch",
	  languageAware: true,
	  properties:
	  /** @lends sap.ui.webcomponents.main.Switch.prototype */
	  {
	    /**
	     * Defines if the <code>ui5-switch</code> is checked.
	     * <br><br>
	     * <b>Note:</b> The property can be changed with user interaction,
	     * either by cliking/tapping on the <code>ui5-switch</code>, or by
	     * pressing the <code>Enter</code> or <code>Space</code> key.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    checked: {
	      type: Boolean
	    },

	    /**
	     * Defines whether the <code>ui5-switch</code> is disabled.
	     * <br><br>
	     * <b>Note:</b> A disabled <code>ui5-switch</code> is noninteractive.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    disabled: {
	      type: Boolean
	    },

	    /**
	     * Defines the text of the <code>ui5-switch</code> when switched on.
	     *
	     * <br><br>
	     * <b>Note:</b> We recommend using short texts, up to 3 letters (larger texts would be cut off).
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    textOn: {
	      type: String
	    },

	    /**
	     * Defines the text of the <code>ui5-switch</code> when switched off.
	     * <br><br>
	     * <b>Note:</b> We recommend using short texts, up to 3 letters (larger texts would be cut off).
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    textOff: {
	      type: String
	    },

	    /**
	     * Defines the <code>ui5-switch</code> type.
	     * <br><br>
	     * <b>Note:</b> If <code>graphical</code> type is set,
	     * positive and negative icons will replace the <code>textOn</code> and <code>textOff</code>.
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    graphical: {
	      type: Boolean
	    }
	  },
	  events:
	  /** @lends sap.ui.webcomponents.main.Switch.prototype */
	  {
	    /**
	     * Fired when the <code>ui5-switch</code> checked state changes.
	     *
	     * @public
	     * @event
	     */
	    change: {}
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 * The <code>ui5-switch</code> component is used for changing between binary states.
	 * <br>
	 * The component can display texts, that will be switched, based on the component state, via the <code>textOn</code> and <code>textOff</code> properties,
	 * but texts longer than 3 letters will be cutted off.
	 * <br>
	 * However, users are able to customize the width of <code>ui5-switch</code> with pure CSS (&lt;ui5-switch style="width: 200px">), and set widths, depending on the texts they would use.
	 * <br>
	 * Note: the component would not automatically stretch to fit the whole text width.
	 *
	 * <h3>Keyboard Handling</h3>
	 * The state can be changed by pressing the Space and Enter keys.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/Switch";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Switch
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-switch
	 * @public
	 * @since 0.8.0
	 */

	var Switch =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Switch, _UI5Element);

	  __chunk_1._createClass(Switch, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return switchCss;
	    }
	  }, {
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main;
	    }
	  }]);

	  function Switch() {
	    var _this;

	    __chunk_1._classCallCheck(this, Switch);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Switch).call(this));
	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    return _this;
	  }

	  __chunk_1._createClass(Switch, [{
	    key: "_onclick",
	    value: function _onclick(event) {
	      this.toggle();
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isSpace(event)) {
	        event.preventDefault();
	      }

	      if (__chunk_8.isEnter(event)) {
	        this.toggle();
	      }
	    }
	  }, {
	    key: "_onkeyup",
	    value: function _onkeyup(event) {
	      if (__chunk_8.isSpace(event)) {
	        this.toggle();
	      }
	    }
	  }, {
	    key: "toggle",
	    value: function toggle() {
	      if (!this.disabled) {
	        this.checked = !this.checked;
	        this.fireEvent("change"); // Angular two way data binding;

	        this.fireEvent("value-changed");
	      }
	    }
	  }, {
	    key: "_textOn",
	    get: function get() {
	      return this.graphical ? "" : this.textOn;
	    }
	  }, {
	    key: "_textOff",
	    get: function get() {
	      return this.graphical ? "" : this.textOff;
	    }
	  }, {
	    key: "tabIndex",
	    get: function get() {
	      return this.disabled ? undefined : "0";
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      var hasLabel = this.graphical || this.textOn || this.textOff;
	      return {
	        main: {
	          "ui5-switch-desktop": __chunk_10.isDesktop(),
	          "ui5-switch--disabled": this.disabled,
	          "ui5-switch--checked": this.checked,
	          "ui5-switch--semantic": this.graphical,
	          "ui5-switch--no-label": !hasLabel
	        }
	      };
	    }
	  }, {
	    key: "ariaDisabled",
	    get: function get() {
	      return this.disabled ? "true" : undefined;
	    }
	  }, {
	    key: "accessibilityOnText",
	    get: function get() {
	      return this._textOn || this.i18nBundle.getText(__chunk_5.SWITCH_ON);
	    }
	  }, {
	    key: "accessibilityOffText",
	    get: function get() {
	      return this._textOff || this.i18nBundle.getText(__chunk_5.SWITCH_OFF);
	    }
	  }, {
	    key: "hiddenText",
	    get: function get() {
	      return this.checked ? this.accessibilityOnText : this.accessibilityOffText;
	    }
	  }], [{
	    key: "onDefine",
	    value: function () {
	      var _onDefine = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee() {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return __chunk_1.fetchI18nBundle("@ui5/webcomponents");

	              case 2:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));

	      function onDefine() {
	        return _onDefine.apply(this, arguments);
	      }

	      return onDefine;
	    }()
	  }, {
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_9.Icon];
	    }
	  }]);

	  return Switch;
	}(__chunk_1.UI5Element);

	Switch.define();

	return Switch;

});
//# sourceMappingURL=Switch.js.map
