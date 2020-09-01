sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-04be579f', './chunk-2e860beb', './chunk-1b10f44e', './chunk-02a372c1', './chunk-390485da', './chunk-47035d43', './chunk-b4193b36', './chunk-b051469f'], function (exports, __chunk_1, __chunk_2, __chunk_3, __chunk_5, __chunk_6, __chunk_7, __chunk_8, __chunk_10, __chunk_13, __chunk_15, __chunk_21, __chunk_25, __chunk_26, __chunk_32, __chunk_34) { 'use strict';

	/**
	 * @lends sap.ui.webcomponents.main.types.InputType.prototype
	 * @public
	 */

	var InputTypes = {
	  /**
	   * <ui5-input type="text"></ui5-input> defines a one-line text input field:
	   * @public
	   * @type {Text}
	   */
	  Text: "Text",

	  /**
	   * The <ui5-input type="email"></ui5-input> is used for input fields that must contain an e-mail address.
	   * @public
	   * @type {Email}
	   */
	  Email: "Email",

	  /**
	   * The <ui5-input type="number"></ui5-input> defines a numeric input field.
	   * @public
	   * @type {Number}
	   */
	  Number: "Number",

	  /**
	   * <ui5-input type="password"></ui5-input> defines a password field.
	   * @public
	   * @type {Password}
	   */
	  Password: "Password",

	  /**
	   * The <ui5-input type="url"></ui5-input> is used for input fields that should contain a telephone number.
	   * @public
	   * @type {Tel}
	   */
	  Tel: "Tel",

	  /**
	   * The <i5-input type="url"></ui5-input> is used for input fields that should contain a URL address.
	   * @public
	   * @type {URL}
	   */
	  URL: "URL"
	};
	/**
	 * @class
	 * Defines input types
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.InputType
	 * @public
	 * @enum {string}
	 */

	var InputType =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(InputType, _DataType);

	  function InputType() {
	    __chunk_1._classCallCheck(this, InputType);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(InputType).apply(this, arguments));
	  }

	  __chunk_1._createClass(InputType, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!InputTypes[value];
	    }
	  }]);

	  return InputType;
	}(__chunk_1.DataType);

	InputType.generataTypeAcessors(InputTypes);

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span id=\"", "-valueStateDesc\" class=\"ui5-hidden-text\">", "</span>"]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span id=\"", "-descr\" class=\"ui5-hidden-text\">", "</span>"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span id=\"", "-suggestionsText\" class=\"ui5-hidden-text\">", "</span><span id=\"", "-selectionText\" class=\"ui5-hidden-text\" aria-live=\"polite\" role=\"status\"></span><span id=\"", "-suggestionsCount\" class=\"ui5-hidden-text\" aria-live=\"polite\">", "</span>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-input-icon-root\"><slot name=\"icon\"></slot></div>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-input-root\" @focusin=\"", "\" @focusout=\"", "\"><div class=\"ui5-input-content\"><input id=\"", "-inner\" class=\"ui5-input-inner\" type=\"", "\" inner-input ?disabled=\"", "\" ?readonly=\"", "\" ?required=\"", "\" .value=\"", "\" placeholder=\"", "\" maxlength=\"", "\" role=\"", "\" aria-owns=\"", "\" ?aria-invalid=\"", "\" aria-haspopup=\"", "\" aria-describedby=\"", "\" aria-autocomplete=\"", "\" aria-expanded=\"", "\" aria-label=\"", "\" aria-required=\"", "\" @input=\"", "\" @change=\"", "\" @keydown=\"", "\" @keyup=\"", "\" @click=", " @focusin=", " data-sap-no-tab-ref data-sap-focus-ref step=\"", "\" />", "", "", "", "</div><slot name=\"formSupport\"></slot></div>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), context._onfocusin, context._onfocusout, __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.inputType), context.disabled, context._readonly, context.required, __chunk_2.ifDefined(context.value), __chunk_2.ifDefined(context.placeholder), __chunk_2.ifDefined(context.maxlength), __chunk_2.ifDefined(context.accInfo.input.role), __chunk_2.ifDefined(context.accInfo.input.ariaOwns), context.accInfo.input.ariaInvalid, __chunk_2.ifDefined(context.accInfo.input.ariaHasPopup), __chunk_2.ifDefined(context.accInfo.input.ariaDescribedBy), __chunk_2.ifDefined(context.accInfo.input.ariaAutoComplete), __chunk_2.ifDefined(context.accInfo.input.ariaExpanded), __chunk_2.ifDefined(context.accInfo.input.ariaLabel), __chunk_2.ifDefined(context.accInfo.input.ariaRequired), context._handleInput, context._handleChange, context._onkeydown, context._onkeyup, context._click, context.innerFocusIn, __chunk_2.ifDefined(context.step), context.icon.length ? block1(context) : undefined, context.showSuggestions ? block2(context) : undefined, context.accInfo.input.ariaDescription ? block3(context) : undefined, context.hasValueState ? block4(context) : undefined);
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2());
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.suggestionsText), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.availableSuggestionsCount));
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.accInfo.input.ariaDescription));
	};

	var block4 = function block4(context) {
	  return __chunk_2.scopedHtml(_templateObject5(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.ariaValueStateHiddenText));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	function _templateObject21() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject21 = function _templateObject21() {
	    return data;
	  };

	  return data;
	}

	function _templateObject20() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject20 = function _templateObject20() {
	    return data;
	  };

	  return data;
	}

	function _templateObject19() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject19 = function _templateObject19() {
	    return data;
	  };

	  return data;
	}

	function _templateObject18() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-popover skip-registry-update _disable-initial-focus prevent-focus-restore no-padding no-arrow class=\"ui5-valuestatemessage-popover\" placement-type=\"Bottom\"><div slot=\"header\" class=\"", "\" style=\"", "\">", "</div></ui5-popover>"]);

	  _templateObject18 = function _templateObject18() {
	    return data;
	  };

	  return data;
	}

	function _templateObject17() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div slot=\"footer\" class=\"ui5-responsive-popover-footer\"><ui5-button design=\"Transparent\" @click=\"", "\">OK</ui5-button></div>"]);

	  _templateObject17 = function _templateObject17() {
	    return data;
	  };

	  return data;
	}

	function _templateObject16() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span slot=\"richDescription\">", "</span>"]);

	  _templateObject16 = function _templateObject16() {
	    return data;
	  };

	  return data;
	}

	function _templateObject15() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-li-suggestion-item image=\"", "\" icon=\"", "\" info=\"", "\" type=\"", "\" info-state=\"", "\" @ui5-_item-press=\"", "\" data-ui5-key=\"", "\">", "", "</ui5-li-suggestion-item>"]);

	  _templateObject15 = function _templateObject15() {
	    return data;
	  };

	  return data;
	}

	function _templateObject14() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-li-groupheader data-ui5-key=\"", "\">", "</ui5-li-groupheader>"]);

	  _templateObject14 = function _templateObject14() {
	    return data;
	  };

	  return data;
	}

	function _templateObject13() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject13 = function _templateObject13() {
	    return data;
	  };

	  return data;
	}

	function _templateObject12() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject12 = function _templateObject12() {
	    return data;
	  };

	  return data;
	}

	function _templateObject11() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject11 = function _templateObject11() {
	    return data;
	  };

	  return data;
	}

	function _templateObject10() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject10 = function _templateObject10() {
	    return data;
	  };

	  return data;
	}

	function _templateObject9() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div slot=\"header\" class=\"ui5-responsive-popover-header ", "\" style=", ">", "</div>"]);

	  _templateObject9 = function _templateObject9() {
	    return data;
	  };

	  return data;
	}

	function _templateObject8() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject8 = function _templateObject8() {
	    return data;
	  };

	  return data;
	}

	function _templateObject7() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject7 = function _templateObject7() {
	    return data;
	  };

	  return data;
	}

	function _templateObject6() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject6 = function _templateObject6() {
	    return data;
	  };

	  return data;
	}

	function _templateObject5$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject5$1 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"row ", "\" style=\"", "\">", "</div>"]);

	  _templateObject4$1 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div slot=\"header\" class=\"ui5-responsive-popover-header\"><div class=\"row\"><span>", "</span><ui5-button class=\"ui5-responsive-popover-close-btn\" icon=\"decline\" design=\"Transparent\" @click=\"", "\"></ui5-button></div><div class=\"row\"><div class=\"input-root-phone\"><input class=\"ui5-input-inner-phone\" type=\"", "\" .value=\"", "\" inner-input placeholder=\"", "\" @input=\"", "\" @change=\"", "\" /></div></div>", "</div>"]);

	  _templateObject3$1 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-responsive-popover no-arrow _disable-initial-focus placement-type=\"Bottom\" horizontal-align=\"Left\" style=\"", "\" @ui5-after-open=\"", "\" @ui5-after-close=\"", "\" @scroll=\"", "\">", "", "<ui5-list separators=\"", "\">", "</ui5-list>", "</ui5-responsive-popover>"]);

	  _templateObject2$1 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["", "", " "]);

	  _templateObject$1 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$1 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$1(), context.showSuggestions ? block1$1(context) : undefined, context.hasValueStateMessage ? block17(context) : undefined);
	};

	var block1$1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2$1(), __chunk_2.styleMap(context.styles.suggestionsPopover), __chunk_2.ifDefined(context._afterOpenPopover), __chunk_2.ifDefined(context._afterClosePopover), context._scroll, context._isPhone ? block2$1(context) : undefined, !context._isPhone ? block7(context) : undefined, __chunk_2.ifDefined(context.suggestionSeparators), __chunk_2.repeat(context.suggestionsTexts, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block12(item, index, context);
	  }), context._isPhone ? block16(context) : undefined);
	};

	var block2$1 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3$1(), __chunk_2.ifDefined(context._headerTitleText), context._closeRespPopover, __chunk_2.ifDefined(context.inputType), __chunk_2.ifDefined(context.value), __chunk_2.ifDefined(context.placeholder), context._handleInput, context._handleChange, context.hasValueStateMessage ? block3$1(context) : undefined);
	};

	var block3$1 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4$1(), __chunk_2.classMap(context.classes.popoverValueState), __chunk_2.styleMap(context.styles.suggestionPopoverHeader), context.shouldDisplayDefaultValueStateMessage ? block4$1(context) : block5(context));
	};

	var block4$1 = function block4(context) {
	  return __chunk_2.scopedHtml(_templateObject5$1(), __chunk_2.ifDefined(context.valueStateText));
	};

	var block5 = function block5(context) {
	  return __chunk_2.scopedHtml(_templateObject6(), __chunk_2.repeat(context.valueStateMessageText, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block6(item, index, context);
	  }));
	};

	var block6 = function block6(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject7(), __chunk_2.ifDefined(item));
	};

	var block7 = function block7(context) {
	  return __chunk_2.scopedHtml(_templateObject8(), context.hasValueStateMessage ? block8(context) : undefined);
	};

	var block8 = function block8(context) {
	  return __chunk_2.scopedHtml(_templateObject9(), __chunk_2.classMap(context.classes.popoverValueState), __chunk_2.styleMap(context.styles.suggestionPopoverHeader), context.shouldDisplayDefaultValueStateMessage ? block9(context) : block10(context));
	};

	var block9 = function block9(context) {
	  return __chunk_2.scopedHtml(_templateObject10(), __chunk_2.ifDefined(context.valueStateText));
	};

	var block10 = function block10(context) {
	  return __chunk_2.scopedHtml(_templateObject11(), __chunk_2.repeat(context.valueStateMessageText, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block11(item, index, context);
	  }));
	};

	var block11 = function block11(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject12(), __chunk_2.ifDefined(item));
	};

	var block12 = function block12(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject13(), item.group ? block13(item, index, context) : block14(item, index, context));
	};

	var block13 = function block13(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject14(), __chunk_2.ifDefined(item.key), __chunk_2.unsafeHTML(item.text));
	};

	var block14 = function block14(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject15(), __chunk_2.ifDefined(item.image), __chunk_2.ifDefined(item.icon), __chunk_2.ifDefined(item.info), __chunk_2.ifDefined(item.type), __chunk_2.ifDefined(item.infoState), __chunk_2.ifDefined(item.fnOnSuggestionItemPress), __chunk_2.ifDefined(item.key), __chunk_2.unsafeHTML(item.text), item.description ? block15(item, index, context) : undefined);
	};

	var block15 = function block15(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject16(), __chunk_2.unsafeHTML(item.description));
	};

	var block16 = function block16(context) {
	  return __chunk_2.scopedHtml(_templateObject17(), context._closeRespPopover);
	};

	var block17 = function block17(context) {
	  return __chunk_2.scopedHtml(_templateObject18(), __chunk_2.classMap(context.classes.popoverValueState), __chunk_2.styleMap(context.styles.popoverHeader), context.shouldDisplayDefaultValueStateMessage ? block18(context) : block19(context));
	};

	var block18 = function block18(context) {
	  return __chunk_2.scopedHtml(_templateObject19(), __chunk_2.ifDefined(context.valueStateText));
	};

	var block19 = function block19(context) {
	  return __chunk_2.scopedHtml(_templateObject20(), __chunk_2.repeat(context.valueStateMessageText, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block20(item, index, context);
	  }));
	};

	var block20 = function block20(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject21(), __chunk_2.ifDefined(item));
	};

	var main$1 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$1(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var styles = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:0;top:0}:host(:not([hidden])){display:inline-block}:host{width:var(--_ui5_input_width);min-width:var(--_ui5_input_width);height:var(--_ui5_input_height);color:var(--sapField_TextColor);font-size:var(--sapFontSize);font-family:var(--sapFontFamily);font-style:normal;background-color:var(--sapField_Background);border:1px solid var(--sapField_BorderColor);border-radius:var(--_ui5_input_wrapper_border_radius);box-sizing:border-box}:host([focused]){outline:var(--_ui5_input_focus_border_width) dotted var(--sapContent_FocusColor);outline-offset:-3px}:host([value-state]:not([value-state=None])[focused]){outline:var(--_ui5_input_focus_border_width) dotted var(--sapContent_FocusColor);outline-offset:-4px}.ui5-input-root{width:100%;height:100%;background:transparent;display:inline-block;outline:none;box-sizing:border-box;color:inherit}:host([disabled]){opacity:var(--_ui5_input_disabled_opacity);cursor:default;pointer-events:none;background:var(--sapField_ReadOnly_Background);border-color:var(--sapField_ReadOnly_BorderColor);-webkit-text-fill-color:var(--sapContent_DisabledTextColor);color:var(--sapContent_DisabledTextColor)}[inner-input]{background:transparent;color:inherit;border:none;font-style:inherit;-webkit-appearance:none;-moz-appearance:textfield;line-height:normal;padding:var(--_ui5_input_inner_padding);box-sizing:border-box;min-width:3rem;text-overflow:ellipsis;flex:1;outline:none;font-size:inherit;font-family:inherit}[inner-input]::selection{background:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}:host([disabled]) [inner-input]::-webkit-input-placeholder{visibility:hidden}:host([readonly]) [inner-input]::-webkit-input-placeholder{visibility:hidden}[inner-input]::-webkit-input-placeholder{font-style:italic;color:var(--sapField_PlaceholderTextColor)}:host([disabled]) [inner-input]::-moz-placeholder{visibility:hidden}:host([readonly]) [inner-input]::-moz-placeholder{visibility:hidden}[inner-input]::-moz-placeholder{font-style:italic;color:var(--sapField_PlaceholderTextColor)}:host([disabled]) [inner-input]:-ms-input-placeholder{visibility:hidden}:host([readonly]) [inner-input]:-ms-input-placeholder{visibility:hidden}[inner-input]:-ms-input-placeholder{font-style:italic;color:var(--sapField_PlaceholderTextColor)}.ui5-input-content{height:100%;box-sizing:border-box;display:flex;flex-direction:row;justify-content:flex-end;overflow:hidden;outline:none;background:transparent;color:inherit}:host([readonly]){border-color:var(--sapField_ReadOnly_BorderColor);background:var(--sapField_ReadOnly_Background)}:host(:not([value-state]):not([readonly]):hover){background-color:var(--sapField_Hover_Background);border:1px solid var(--sapField_Hover_BorderColor)}:host([value-state=None]:not([readonly]):hover){background-color:var(--sapField_Hover_Background);border:1px solid var(--sapField_Hover_BorderColor)}:host([value-state]:not([value-state=None])){border-width:var(--_ui5_input_state_border_width)}:host([value-state=Error]) [inner-input],:host([value-state=Warning]) [inner-input]{font-style:var(--_ui5_input_error_warning_font_style)}:host([value-state=Error]) [inner-input]{font-weight:var(--_ui5_input_error_font_weight)}:host([value-state=Error]:not([readonly])){background-color:var(--sapField_InvalidBackground);border-color:var(--sapField_InvalidColor)}:host([value-state=Error]:not([readonly]):not([disabled])),:host([value-state=Information]:not([readonly]):not([disabled])),:host([value-state=Warning]:not([readonly]):not([disabled])){border-style:var(--_ui5_input_error_warning_border_style)}:host([value-state=Warning]:not([readonly])){background-color:var(--sapField_WarningBackground);border-color:var(--sapField_WarningColor)}:host([value-state=Success]:not([readonly])){background-color:var(--sapField_SuccessBackground);border-color:var(--sapField_SuccessColor);border-width:1px}:host([value-state=Information]:not([readonly])){background-color:var(--sapField_InformationBackground);border-color:var(--sapField_InformationColor);border-width:var(--_ui5-input-information_border_width)}[inner-input]::-ms-clear{height:0;width:0}.ui5-input-icon-root{min-width:var(--_ui5_input_icon_min_width);height:100%;display:flex;justify-content:center;align-items:center}::slotted([ui5-icon][slot=icon]){padding:var(--_ui5_input_icon_padding)}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-input",
	  languageAware: true,
	  managedSlots: true,
	  slots:
	  /** @lends sap.ui.webcomponents.main.Input.prototype */
	  {
	    /**
	     * Defines the icon to be displayed in the <code>ui5-input</code>.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    icon: {
	      type: HTMLElement
	    },

	    /**
	     * Defines the <code>ui5-input</code> suggestion items.
	     * <br><br>
	     * Example:
	     * <br><br>
	     * &lt;ui5-input show-suggestions><br>
	     * &nbsp;&nbsp;&nbsp;&nbsp;&lt;ui5-suggestion-item text="Item #1">&lt;/ui5-suggestion-item><br>
	     * &nbsp;&nbsp;&nbsp;&nbsp;&lt;ui5-suggestion-item text="Item #2">&lt;/ui5-suggestion-item><br>
	     * &lt;/ui5-input>
	     * <br>
	     * <ui5-input show-suggestions>
	     * <ui5-suggestion-item text="Item #1"></ui5-suggestion-item>
	     * <ui5-suggestion-item text="Item #2"></ui5-suggestion-item>
	     * </ui5-input>
	     * <br><br>
	     * <b>Note:</b> The suggestion would be displayed only if the <code>showSuggestions</code>
	     * property is set to <code>true</code>.
	     * <br><br>
	     * <b>Note:</b> The &lt;ui5-suggestion-item> is recommended to be used as a suggestion item.
	     * Importing the Input Suggestions Support feature:
	     * <br>
	     * <code>import "@ui5/webcomponents/dist/features/InputSuggestions.js";</code>
	     * <br>
	     * also automatically imports the &lt;ui5-suggestion-item> for your convenience.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      propertyName: "suggestionItems",
	      type: HTMLElement
	    },

	    /**
	     * The slot is used for native <code>input</code> HTML element to enable form submit,
	     * when <code>name</code> property is set.
	     * @type {HTMLElement[]}
	     * @private
	     */
	    formSupport: {
	      type: HTMLElement
	    },

	    /**
	     * Defines the value state message that will be displayed as pop up under the <code>ui5-input</code>.
	     * <br><br>
	     *
	     * <b>Note:</b> If not specified, a default text (in the respective language) will be displayed.
	     * <br>
	     * <b>Note:</b> The <code>valueStateMessage</code> would be displayed,
	     * when the <code>ui5-input</code> is in <code>Information</code>, <code>Warning</code> or <code>Error</code> value state.
	     * <br>
	     * <b>Note:</b> If the <code>ui5-input</code> has <code>suggestionItems</code>,
	     * the <code>valueStateMessage</code> would be displayed as part of the same popover, if used on desktop, or dialog - on phone.
	     * @type {HTMLElement[]}
	     * @since 1.0.0-rc.6
	     * @slot
	     * @public
	     */
	    valueStateMessage: {
	      type: HTMLElement
	    }
	  },
	  properties:
	  /** @lends  sap.ui.webcomponents.main.Input.prototype */
	  {
	    /**
	     * Defines whether the <code>ui5-input</code> is in disabled state.
	     * <br><br>
	     * <b>Note:</b> A disabled <code>ui5-input</code> is completely noninteractive.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    disabled: {
	      type: Boolean
	    },

	    /**
	     * Defines if characters within the suggestions are to be highlighted
	     * in case the input value matches parts of the suggestions text.
	     * <br><br>
	     * <b>Note:</b> takes effect when <code>showSuggestions</code> is set to <code>true</code>
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     * @sicne 1.0.0-rc.8
	     */
	    highlight: {
	      type: Boolean
	    },

	    /**
	     * Defines a short hint intended to aid the user with data entry when the
	     * <code>ui5-input</code> has no value.
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    placeholder: {
	      type: String
	    },

	    /**
	     * Defines whether the <code>ui5-input</code> is read-only.
	     * <br><br>
	     * <b>Note:</b> A read-only <code>ui5-input</code> is not editable,
	     * but still provides visual feedback upon user interaction.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    readonly: {
	      type: Boolean
	    },

	    /**
	     * Defines whether the <code>ui5-input</code> is required.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     * @since 1.0.0-rc.3
	     */
	    required: {
	      type: Boolean
	    },

	    /**
	     * Defines the HTML type of the <code>ui5-input</code>.
	     * Available options are: <code>Text</code>, <code>Email</code>,
	     * <code>Number</code>, <code>Password</code>, <code>Tel</code>, and <code>URL</code>.
	     * <br><br>
	     * <b>Notes:</b>
	     * <ul>
	     * <li>The particular effect of this property differs depending on the browser
	     * and the current language settings, especially for type <code>Number</code>.</li>
	     * <li>The property is mostly intended to be used with touch devices
	     * that use different soft keyboard layouts depending on the given input type.</li>
	     * </ul>
	     *
	     * @type {InputType}
	     * @defaultvalue "Text"
	     * @public
	     */
	    type: {
	      type: InputType,
	      defaultValue: InputType.Text
	    },

	    /**
	     * Defines the value of the <code>ui5-input</code>.
	     * <br><br>
	     * <b>Note:</b> The property is updated upon typing.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    value: {
	      type: String
	    },

	    /**
	     * Defines the value state of the <code>ui5-input</code>.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>None</code></li>
	     * <li><code>Error</code></li>
	     * <li><code>Warning</code></li>
	     * <li><code>Success</code></li>
	     * <li><code>Information</code></li>
	     * </ul>
	     *
	     * @type {ValueState}
	     * @defaultvalue "None"
	     * @public
	     */
	    valueState: {
	      type: __chunk_21.ValueState,
	      defaultValue: __chunk_21.ValueState.None
	    },

	    /**
	     * Determines the name with which the <code>ui5-input</code> will be submitted in an HTML form.
	     *
	     * <br><br>
	     * <b>Important:</b> For the <code>name</code> property to have effect, you must add the following import to your project:
	     * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
	     *
	     * <br><br>
	     * <b>Note:</b> When set, a native <code>input</code> HTML element
	     * will be created inside the <code>ui5-input</code> so that it can be submitted as
	     * part of an HTML form. Do not use this property unless you need to submit a form.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    name: {
	      type: String
	    },

	    /**
	     * Defines whether the <code>ui5-input</code> should show suggestions, if such are present.
	     * <br><br>
	     * <b>Note:</b>
	     * Don`t forget to import the <code>InputSuggestions</code> module from <code>"@ui5/webcomponents/dist/features/InputSuggestions.js"</code> to enable this functionality.
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    showSuggestions: {
	      type: Boolean
	    },

	    /**
	     * Sets the maximum number of characters available in the input field.
	     *
	     * @type {Integer}
	     * @since 1.0.0-rc.5
	     * @public
	     */
	    maxlength: {
	      type: __chunk_1.Integer
	    },

	    /**
	     * Defines the aria-label attribute for the input
	     *
	     * @type {String}
	     * @since 1.0.0-rc.8
	     * @private
	     * @defaultvalue ""
	     */
	    ariaLabel: {
	      type: String
	    },

	    /**
	     * Receives id(or many ids) of the elements that label the input
	     *
	     * @type {String}
	     * @defaultvalue ""
	     * @private
	     * @since 1.0.0-rc.8
	     */
	    ariaLabelledby: {
	      type: String,
	      defaultValue: ""
	    },

	    /**
	     * @private
	     */
	    focused: {
	      type: Boolean
	    },
	    _input: {
	      type: Object
	    },
	    _inputAccInfo: {
	      type: Object
	    },
	    _wrapperAccInfo: {
	      type: Object
	    },
	    _inputWidth: {
	      type: __chunk_1.Integer
	    },
	    _listWidth: {
	      type: __chunk_1.Integer
	    },
	    _isPopoverOpen: {
	      type: Boolean,
	      noAttribute: true
	    },
	    _inputIconFocused: {
	      type: Boolean,
	      noAttribute: true
	    }
	  },
	  events:
	  /** @lends  sap.ui.webcomponents.main.Input.prototype */
	  {
	    /**
	     * Fired when the input operation has finished by pressing Enter or on focusout.
	     *
	     * @event
	     * @public
	     */
	    change: {},

	    /**
	     * Fired when the value of the <code>ui5-input</code> changes at each keystroke,
	     * and when a suggestion item has been selected.
	     *
	     * @event
	     * @public
	     */
	    input: {},

	    /**
	     * Fired when user presses Enter key on the <code>ui5-input</code>.
	     * <br><br>
	     * <b>Note:</b> The event is fired independent of whether there was a change before or not.
	     * If change was performed, the event is fired after the change event.
	     * The event is also fired when an item of the select list is selected by pressing Enter.
	     *
	     * @event
	     * @public
	     */
	    submit: {},

	    /**
	     * Fired when a suggestion item, that is displayed in the suggestion popup, is selected.
	     *
	     * @event sap.ui.webcomponents.main.Input#suggestion-item-select
	     * @param {HTMLElement} item The selected item
	     * @public
	     */
	    "suggestion-item-select": {
	      detail: {
	        item: {
	          type: HTMLElement
	        }
	      }
	    },

	    /**
	     * Fired when the user navigates to a suggestion item via the ARROW keys,
	     * as a preview, before the final selection.
	     *
	     * @event sap.ui.webcomponents.main.Input#suggestion-item-preview
	     * @param {HTMLElement} item The previewed suggestion item
	     * @param {HTMLElement} targetRef The DOM ref of the suggestion item.
	     * @public
	     * @since 1.0.0-rc.8
	     */
	    "suggestion-item-preview": {
	      detail: {
	        item: {
	          type: HTMLElement
	        },
	        targetRef: {
	          type: HTMLElement
	        }
	      }
	    },

	    /**
	     * Fired when the user scrolls the suggestion popover.
	     *
	     * @event sap.ui.webcomponents.main.Input#suggestion-scroll
	     * @param {Integer} scrollTop The current scroll position
	     * @param {HTMLElement} scrollContainer The scroll container
	     * @public
	     * @since 1.0.0-rc.8
	     */
	    "suggestion-scroll": {
	      detail: {
	        scrollTop: {
	          type: __chunk_1.Integer
	        },
	        scrollContainer: {
	          type: HTMLElement
	        }
	      }
	    }
	  }
	};
	/**
	 * @class
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-input</code> component allows the user to enter and edit text or numeric values in one line.
	 * <br>
	 * Additionally, you can provide <code>suggestionItems</code>,
	 * that are displayed in a popover right under the input.
	 * <br><br>
	 * The text field can be editable or read-only (<code>readonly</code> property),
	 * and it can be enabled or disabled (<code>enabled</code> property).
	 * To visualize semantic states, such as "error" or "warning", the <code>valueState</code> property is provided.
	 * When the user makes changes to the text, the change event is fired,
	 * which enables you to react on any text change.
	 * <br><br>
	 * <b>Note:</b> If you are using the <code>ui5-input</code> as a single npm module,
	 * don't forget to import the <code>InputSuggestions</code> module from
	 * "@ui5/webcomponents/dist/features/InputSuggestions.js"
	 * to enable the suggestions functionality.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/Input.js";</code>
	 * <br>
	 * <code>import "@ui5/webcomponents/dist/features/InputSuggestions.js";</code> (optional - for input suggestions support)
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Input
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-input
	 * @appenddocs SuggestionItem
	 * @public
	 */

	var Input =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Input, _UI5Element);

	  __chunk_1._createClass(Input, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
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
	  }, {
	    key: "staticAreaTemplate",
	    get: function get() {
	      return main$1;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return styles;
	    }
	  }, {
	    key: "staticAreaStyles",
	    get: function get() {
	      return [__chunk_25.ResponsivePopoverCommonCss, __chunk_34.ValueStateMessageCss];
	    }
	  }]);

	  function Input() {
	    var _this;

	    __chunk_1._classCallCheck(this, Input);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Input).call(this)); // Indicates if there is selected suggestionItem.

	    _this.hasSuggestionItemSelected = false; // Represents the value before user moves selection between the suggestion items.
	    // Used to register and fire "input" event upon [SPACE] or [ENTER].
	    // Note: the property "value" is updated upon selection move and can`t be used.

	    _this.valueBeforeItemSelection = ""; // tracks the value between focus in and focus out to detect that change event should be fired.

	    _this.previousValue = undefined; // Indicates, if the component is rendering for first time.

	    _this.firstRendering = true; // The value that should be highlited.

	    _this.highlightValue = ""; // all sementic events

	    _this.EVENT_SUBMIT = "submit";
	    _this.EVENT_CHANGE = "change";
	    _this.EVENT_INPUT = "input";
	    _this.EVENT_SUGGESTION_ITEM_SELECT = "suggestion-item-select"; // all user interactions

	    _this.ACTION_ENTER = "enter";
	    _this.ACTION_USER_INPUT = "input"; // Suggestions array initialization

	    _this.suggestionsTexts = [];
	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    _this._handleResizeBound = _this._handleResize.bind(__chunk_1._assertThisInitialized(_this));
	    return _this;
	  }

	  __chunk_1._createClass(Input, [{
	    key: "onEnterDOM",
	    value: function onEnterDOM() {
	      __chunk_32.ResizeHandler.register(this, this._handleResizeBound);
	    }
	  }, {
	    key: "onExitDOM",
	    value: function onExitDOM() {
	      __chunk_32.ResizeHandler.deregister(this, this._handleResizeBound);
	    }
	  }, {
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      if (this.showSuggestions) {
	        this.enableSuggestions();
	        this.suggestionsTexts = this.Suggestions.defaultSlotProperties(this.highlightValue);
	      }

	      var FormSupport = __chunk_1.getFeature("FormSupport");

	      if (FormSupport) {
	        FormSupport.syncNativeHiddenInput(this);
	      } else if (this.name) {
	        console.warn("In order for the \"name\" property to have effect, you should also: import \"@ui5/webcomponents/dist/features/InputElementsFormSupport.js\";"); // eslint-disable-line
	      }
	    }
	  }, {
	    key: "onAfterRendering",
	    value: function () {
	      var _onAfterRendering = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee2() {
	        var _this2 = this;

	        var shouldOpenSuggestions;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                if (!(!this.firstRendering && !__chunk_10.isPhone() && this.Suggestions)) {
	                  _context2.next = 8;
	                  break;
	                }

	                shouldOpenSuggestions = this.shouldOpenSuggestions();
	                this.Suggestions.toggle(shouldOpenSuggestions, {
	                  preventFocusRestore: !this.hasSuggestionItemSelected
	                });
	                __chunk_1.RenderScheduler.whenFinished().then(
	                /*#__PURE__*/
	                __chunk_1._asyncToGenerator(
	                /*#__PURE__*/
	                regeneratorRuntime.mark(function _callee() {
	                  return regeneratorRuntime.wrap(function _callee$(_context) {
	                    while (1) {
	                      switch (_context.prev = _context.next) {
	                        case 0:
	                          _context.next = 2;
	                          return _this2.Suggestions._getListWidth();

	                        case 2:
	                          _this2._listWidth = _context.sent;

	                        case 3:
	                        case "end":
	                          return _context.stop();
	                      }
	                    }
	                  }, _callee);
	                })));

	                if (!(!__chunk_10.isPhone() && shouldOpenSuggestions)) {
	                  _context2.next = 8;
	                  break;
	                }

	                _context2.next = 7;
	                return this.getInputDOMRef();

	              case 7:
	                _context2.sent.focus();

	              case 8:
	                if (!this.firstRendering && this.hasValueStateMessage) {
	                  this.toggle(this.shouldDisplayOnlyValueStateMessage);
	                }

	                this.firstRendering = false;

	              case 10:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function onAfterRendering() {
	        return _onAfterRendering.apply(this, arguments);
	      }

	      return onAfterRendering;
	    }()
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isUp(event)) {
	        return this._handleUp(event);
	      }

	      if (__chunk_8.isDown(event)) {
	        return this._handleDown(event);
	      }

	      if (__chunk_8.isSpace(event)) {
	        return this._handleSpace(event);
	      }

	      if (__chunk_8.isEnter(event)) {
	        return this._handleEnter(event);
	      }

	      this._keyDown = true;
	    }
	  }, {
	    key: "_onkeyup",
	    value: function _onkeyup(event) {
	      this._keyDown = false;
	    }
	    /* Event handling */

	  }, {
	    key: "_handleUp",
	    value: function _handleUp(event) {
	      if (this.Suggestions && this.Suggestions.isOpened()) {
	        this.Suggestions.onUp(event);
	      }
	    }
	  }, {
	    key: "_handleDown",
	    value: function _handleDown(event) {
	      if (this.Suggestions && this.Suggestions.isOpened()) {
	        this.Suggestions.onDown(event);
	      }
	    }
	  }, {
	    key: "_handleSpace",
	    value: function _handleSpace(event) {
	      if (this.Suggestions) {
	        this.Suggestions.onSpace(event);
	      }
	    }
	  }, {
	    key: "_handleEnter",
	    value: function _handleEnter(event) {
	      var itemPressed = !!(this.Suggestions && this.Suggestions.onEnter(event));

	      if (!itemPressed) {
	        this.fireEventByAction(this.ACTION_ENTER);
	      }
	    }
	  }, {
	    key: "_onfocusin",
	    value: function () {
	      var _onfocusin2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee3(event) {
	        var inputDomRef;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.next = 2;
	                return this.getInputDOMRef();

	              case 2:
	                inputDomRef = _context3.sent;

	                if (!(event.target !== inputDomRef)) {
	                  _context3.next = 5;
	                  break;
	                }

	                return _context3.abrupt("return");

	              case 5:
	                this.focused = true; // invalidating property

	                this.previousValue = this.value;
	                this._inputIconFocused = event.target && event.target === this.querySelector("[ui5-icon]");

	              case 8:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function _onfocusin(_x) {
	        return _onfocusin2.apply(this, arguments);
	      }

	      return _onfocusin;
	    }()
	  }, {
	    key: "_onfocusout",
	    value: function _onfocusout(event) {
	      var focusedOutToSuggestions = this.Suggestions && event.relatedTarget && event.relatedTarget.shadowRoot && event.relatedTarget.shadowRoot.contains(this.Suggestions.responsivePopover);
	      var focusedOutToValueStateMessage = event.relatedTarget && event.relatedTarget.shadowRoot && event.relatedTarget.shadowRoot.querySelector(".ui5-valuestatemessage-root"); // if focusout is triggered by pressing on suggestion item or value state message popover, skip invalidation, because re-rendering
	      // will happen before "itemPress" event, which will make item "active" state not visualized

	      if (focusedOutToSuggestions || focusedOutToValueStateMessage) {
	        event.stopImmediatePropagation();
	        return;
	      }

	      var toBeFocused = event.relatedTarget;

	      if (toBeFocused && toBeFocused.classList.contains(this._id)) {
	        return;
	      }

	      this.closePopover();
	      this.previousValue = "";
	      this.focused = false; // invalidating property
	    }
	  }, {
	    key: "_click",
	    value: function _click(event) {
	      if (__chunk_10.isPhone() && !this.readonly && this.Suggestions) {
	        this.Suggestions.open(this);
	        this.isRespPopoverOpen = true;
	      }
	    }
	  }, {
	    key: "_handleChange",
	    value: function _handleChange(event) {
	      this.fireEvent(this.EVENT_CHANGE);
	    }
	  }, {
	    key: "_scroll",
	    value: function _scroll(event) {
	      var detail = event.detail;
	      this.fireEvent("suggestion-scroll", {
	        scrollTop: detail.scrollTop,
	        scrollContainer: detail.targetRef
	      });
	    }
	  }, {
	    key: "_handleInput",
	    value: function () {
	      var _handleInput2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee4(event) {
	        var inputDomRef, skipFiring;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return this.getInputDOMRef();

	              case 2:
	                inputDomRef = _context4.sent;

	                if (!(this.value && this.type === InputType.Number && !__chunk_8.isBackSpace(event) && !inputDomRef.value)) {
	                  _context4.next = 5;
	                  break;
	                }

	                return _context4.abrupt("return");

	              case 5:
	                if (event.target === inputDomRef) {
	                  // stop the native event, as the semantic "input" would be fired.
	                  event.stopImmediatePropagation();
	                }
	                /* skip calling change event when an input with a placeholder is focused on IE
	                	- value of the host and the internal input should be differnt in case of actual input
	                	- input is called when a key is pressed => keyup should not be called yet
	                */


	                skipFiring = inputDomRef.value === this.value && __chunk_10.isIE() && !this._keyDown && !!this.placeholder;
	                !skipFiring && this.fireEventByAction(this.ACTION_USER_INPUT);
	                this.hasSuggestionItemSelected = false;

	                if (this.Suggestions) {
	                  this.Suggestions.updateSelectedItemPosition(null);
	                }

	              case 10:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));

	      function _handleInput(_x2) {
	        return _handleInput2.apply(this, arguments);
	      }

	      return _handleInput;
	    }()
	  }, {
	    key: "_handleResize",
	    value: function _handleResize() {
	      this._inputWidth = this.offsetWidth;
	    }
	  }, {
	    key: "_closeRespPopover",
	    value: function _closeRespPopover() {
	      this.Suggestions.close();
	    }
	  }, {
	    key: "_afterOpenPopover",
	    value: function () {
	      var _afterOpenPopover2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee5() {
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                if (!__chunk_10.isPhone()) {
	                  _context5.next = 4;
	                  break;
	                }

	                _context5.next = 3;
	                return this.getInputDOMRef();

	              case 3:
	                _context5.sent.focus();

	              case 4:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));

	      function _afterOpenPopover() {
	        return _afterOpenPopover2.apply(this, arguments);
	      }

	      return _afterOpenPopover;
	    }()
	  }, {
	    key: "_afterClosePopover",
	    value: function _afterClosePopover() {
	      this.announceSelectedItem(); // close device's keyboard and prevent further typing

	      if (__chunk_10.isPhone()) {
	        this.blur();
	      }
	    }
	  }, {
	    key: "toggle",
	    value: function toggle(isToggled) {
	      if (isToggled && !this.isRespPopoverOpen) {
	        this.openPopover();
	      } else {
	        this.closePopover();
	      }
	    }
	    /**
	     * Checks if the value state popover is open.
	     * @returns {Boolean} true if the popover is open, false otherwise
	     * @public
	     */

	  }, {
	    key: "isOpen",
	    value: function isOpen() {
	      return !!this._isPopoverOpen;
	    }
	  }, {
	    key: "openPopover",
	    value: function () {
	      var _openPopover = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee6() {
	        var popover;
	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                _context6.next = 2;
	                return this._getPopover();

	              case 2:
	                popover = _context6.sent;

	                if (popover) {
	                  this._isPopoverOpen = true;
	                  popover.openBy(this);
	                }

	              case 4:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this);
	      }));

	      function openPopover() {
	        return _openPopover.apply(this, arguments);
	      }

	      return openPopover;
	    }()
	  }, {
	    key: "closePopover",
	    value: function () {
	      var _closePopover = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee7() {
	        var popover;
	        return regeneratorRuntime.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                _context7.next = 2;
	                return this._getPopover();

	              case 2:
	                popover = _context7.sent;
	                popover && popover.close();

	              case 4:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7, this);
	      }));

	      function closePopover() {
	        return _closePopover.apply(this, arguments);
	      }

	      return closePopover;
	    }()
	  }, {
	    key: "_getPopover",
	    value: function () {
	      var _getPopover2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee8() {
	        var staticAreaItem;
	        return regeneratorRuntime.wrap(function _callee8$(_context8) {
	          while (1) {
	            switch (_context8.prev = _context8.next) {
	              case 0:
	                _context8.next = 2;
	                return this.getStaticAreaItemDomRef();

	              case 2:
	                staticAreaItem = _context8.sent;
	                return _context8.abrupt("return", staticAreaItem.querySelector("[ui5-popover]"));

	              case 4:
	              case "end":
	                return _context8.stop();
	            }
	          }
	        }, _callee8, this);
	      }));

	      function _getPopover() {
	        return _getPopover2.apply(this, arguments);
	      }

	      return _getPopover;
	    }()
	  }, {
	    key: "enableSuggestions",
	    value: function enableSuggestions() {
	      if (this.Suggestions) {
	        this.Suggestions.highlight = this.highlight;
	        return;
	      }

	      var Suggestions = __chunk_1.getFeature("InputSuggestions");

	      if (Suggestions) {
	        this.Suggestions = new Suggestions(this, "suggestionItems", this.highlight);
	      } else {
	        throw new Error("You have to import \"@ui5/webcomponents/dist/features/InputSuggestions.js\" module to use ui5-input suggestions");
	      }
	    }
	  }, {
	    key: "shouldOpenSuggestions",
	    value: function shouldOpenSuggestions() {
	      return !!(this.suggestionItems.length && this.focused && this.showSuggestions && !this.hasSuggestionItemSelected);
	    }
	  }, {
	    key: "selectSuggestion",
	    value: function selectSuggestion(item, keyboardUsed) {
	      if (item.group) {
	        return;
	      }

	      var itemText = item.text || item.textContent; // keep textContent for compatibility

	      var fireInput = keyboardUsed ? this.valueBeforeItemSelection !== itemText : this.value !== itemText;
	      this.hasSuggestionItemSelected = true;

	      if (fireInput) {
	        this.value = itemText;
	        this.valueBeforeItemSelection = itemText;
	        this.fireEvent(this.EVENT_INPUT);
	        this.fireEvent(this.EVENT_CHANGE);
	      }

	      this.fireEvent(this.EVENT_SUGGESTION_ITEM_SELECT, {
	        item: item
	      });
	    }
	  }, {
	    key: "previewSuggestion",
	    value: function previewSuggestion(item) {
	      this.valueBeforeItemSelection = this.value;
	      this.updateValueOnPreview(item);
	      this.announceSelectedItem();
	      this._previewItem = item;
	    }
	    /**
	     * Updates the input value on item preview.
	     * @param {Object} item The item that is on preview
	     */

	  }, {
	    key: "updateValueOnPreview",
	    value: function updateValueOnPreview(item) {
	      var noPreview = item.type === "Inactive" || item.group;
	      var itemValue = noPreview ? "" : item.effectiveTitle || item.textContent;
	      this.value = itemValue;
	    }
	    /**
	     * The suggestion item on preview.
	     * @type { ui5-suggestion-item }
	     * @readonly
	     * @public
	     */

	  }, {
	    key: "fireEventByAction",
	    value: function () {
	      var _fireEventByAction = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee9(action) {
	        var inputValue, isSubmit, isUserInput, input, cursorPosition, valueChanged;
	        return regeneratorRuntime.wrap(function _callee9$(_context9) {
	          while (1) {
	            switch (_context9.prev = _context9.next) {
	              case 0:
	                _context9.next = 2;
	                return this.getInputDOMRef();

	              case 2:
	                if (!(this.disabled || this.readonly)) {
	                  _context9.next = 4;
	                  break;
	                }

	                return _context9.abrupt("return");

	              case 4:
	                _context9.next = 6;
	                return this.getInputValue();

	              case 6:
	                inputValue = _context9.sent;
	                isSubmit = action === this.ACTION_ENTER;
	                isUserInput = action === this.ACTION_USER_INPUT;
	                _context9.next = 11;
	                return this.getInputDOMRef();

	              case 11:
	                input = _context9.sent;
	                cursorPosition = input.selectionStart;
	                this.value = inputValue;
	                this.highlightValue = inputValue;

	                if (__chunk_10.isSafari()) {
	                  // When setting the value by hand, Safari moves the cursor when typing in the middle of the text (See #1761)
	                  setTimeout(function () {
	                    input.selectionStart = cursorPosition;
	                    input.selectionEnd = cursorPosition;
	                  }, 0);
	                }

	                if (!isUserInput) {
	                  _context9.next = 20;
	                  break;
	                }

	                // input
	                this.fireEvent(this.EVENT_INPUT); // Angular two way data binding

	                this.fireEvent("value-changed");
	                return _context9.abrupt("return");

	              case 20:
	                if (isSubmit) {
	                  // submit
	                  this.fireEvent(this.EVENT_SUBMIT);
	                } // In IE, pressing the ENTER does not fire change


	                valueChanged = this.previousValue !== undefined && this.previousValue !== this.value;

	                if (__chunk_10.isIE() && isSubmit && valueChanged) {
	                  this.fireEvent(this.EVENT_CHANGE);
	                }

	              case 23:
	              case "end":
	                return _context9.stop();
	            }
	          }
	        }, _callee9, this);
	      }));

	      function fireEventByAction(_x3) {
	        return _fireEventByAction.apply(this, arguments);
	      }

	      return fireEventByAction;
	    }()
	  }, {
	    key: "getInputValue",
	    value: function () {
	      var _getInputValue = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee10() {
	        var domRef;
	        return regeneratorRuntime.wrap(function _callee10$(_context10) {
	          while (1) {
	            switch (_context10.prev = _context10.next) {
	              case 0:
	                domRef = this.getDomRef();

	                if (!domRef) {
	                  _context10.next = 5;
	                  break;
	                }

	                _context10.next = 4;
	                return this.getInputDOMRef();

	              case 4:
	                return _context10.abrupt("return", _context10.sent.value);

	              case 5:
	                return _context10.abrupt("return", "");

	              case 6:
	              case "end":
	                return _context10.stop();
	            }
	          }
	        }, _callee10, this);
	      }));

	      function getInputValue() {
	        return _getInputValue.apply(this, arguments);
	      }

	      return getInputValue;
	    }()
	  }, {
	    key: "getInputDOMRef",
	    value: function () {
	      var _getInputDOMRef = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee11() {
	        return regeneratorRuntime.wrap(function _callee11$(_context11) {
	          while (1) {
	            switch (_context11.prev = _context11.next) {
	              case 0:
	                if (!(__chunk_10.isPhone() && this.Suggestions && this.suggestionItems.length)) {
	                  _context11.next = 4;
	                  break;
	                }

	                _context11.next = 3;
	                return this.Suggestions._respPopover();

	              case 3:
	                return _context11.abrupt("return", this.Suggestions && this.Suggestions.responsivePopover.querySelector(".ui5-input-inner-phone"));

	              case 4:
	                return _context11.abrupt("return", this.getDomRef().querySelector("input"));

	              case 5:
	              case "end":
	                return _context11.stop();
	            }
	          }
	        }, _callee11, this);
	      }));

	      function getInputDOMRef() {
	        return _getInputDOMRef.apply(this, arguments);
	      }

	      return getInputDOMRef;
	    }()
	  }, {
	    key: "getLabelableElementId",
	    value: function getLabelableElementId() {
	      return this.getInputId();
	    }
	  }, {
	    key: "getSuggestionByListItem",
	    value: function getSuggestionByListItem(item) {
	      var key = parseInt(item.getAttribute("data-ui5-key"));
	      return this.suggestionItems[key];
	    }
	    /**
	     * Returns if the suggestions popover is scrollable.
	     * The method returns <code>Promise</code> that resolves to true,
	     * if the popup is scrollable and false otherwise.
	     * @returns {Promise}
	     */

	  }, {
	    key: "isSuggestionsScrollable",
	    value: function isSuggestionsScrollable() {
	      if (!this.Suggestions) {
	        return Promise.resolve(false);
	      }

	      return this.Suggestions._isScrollable();
	    }
	  }, {
	    key: "getInputId",
	    value: function getInputId() {
	      return "".concat(this._id, "-inner");
	    }
	    /* Suggestions interface  */

	  }, {
	    key: "onItemFocused",
	    value: function onItemFocused() {}
	  }, {
	    key: "onItemMouseOver",
	    value: function onItemMouseOver(event) {
	      var item = event.target;
	      var suggestion = this.getSuggestionByListItem(item);
	      suggestion && suggestion.fireEvent("mouseover", {
	        item: suggestion,
	        targetRef: item
	      });
	    }
	  }, {
	    key: "onItemMouseOut",
	    value: function onItemMouseOut(event) {
	      var item = event.target;
	      var suggestion = this.getSuggestionByListItem(item);
	      suggestion && suggestion.fireEvent("mouseout", {
	        item: suggestion,
	        targetRef: item
	      });
	    }
	  }, {
	    key: "onItemSelected",
	    value: function onItemSelected(item, keyboardUsed) {
	      this.selectSuggestion(item, keyboardUsed);
	    }
	  }, {
	    key: "onItemPreviewed",
	    value: function onItemPreviewed(item) {
	      this.previewSuggestion(item);
	      this.fireEvent("suggestion-item-preview", {
	        item: this.getSuggestionByListItem(item),
	        targetRef: item
	      });
	    }
	  }, {
	    key: "onOpen",
	    value: function onOpen() {}
	  }, {
	    key: "onClose",
	    value: function onClose() {}
	  }, {
	    key: "valueStateTextMappings",
	    value: function valueStateTextMappings() {
	      var i18nBundle = this.i18nBundle;
	      return {
	        "Success": i18nBundle.getText(__chunk_5.VALUE_STATE_SUCCESS),
	        "Information": i18nBundle.getText(__chunk_5.VALUE_STATE_INFORMATION),
	        "Error": i18nBundle.getText(__chunk_5.VALUE_STATE_ERROR),
	        "Warning": i18nBundle.getText(__chunk_5.VALUE_STATE_WARNING)
	      };
	    }
	  }, {
	    key: "announceSelectedItem",
	    value: function announceSelectedItem() {
	      var invisibleText = this.shadowRoot.querySelector("#".concat(this._id, "-selectionText"));

	      if (this.Suggestions && this.Suggestions._isItemOnTarget()) {
	        invisibleText.textContent = this.itemSelectionAnnounce;
	      } else {
	        invisibleText.textContent = "";
	      }
	    }
	  }, {
	    key: "previewItem",
	    get: function get() {
	      if (!this._previewItem) {
	        return null;
	      }

	      return this.getSuggestionByListItem(this._previewItem);
	    }
	  }, {
	    key: "_readonly",
	    get: function get() {
	      return this.readonly && !this.disabled;
	    }
	  }, {
	    key: "_headerTitleText",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.INPUT_SUGGESTIONS_TITLE);
	    }
	  }, {
	    key: "inputType",
	    get: function get() {
	      return this.type.toLowerCase();
	    }
	  }, {
	    key: "suggestionsTextId",
	    get: function get() {
	      return this.showSuggestions ? "".concat(this._id, "-suggestionsText") : "";
	    }
	  }, {
	    key: "valueStateTextId",
	    get: function get() {
	      return this.hasValueState ? "".concat(this._id, "-valueStateDesc") : "";
	    }
	  }, {
	    key: "accInfo",
	    get: function get() {
	      var ariaHasPopupDefault = this.showSuggestions ? "true" : undefined;
	      var ariaAutoCompleteDefault = this.showSuggestions ? "list" : undefined;
	      var ariaDescribedBy = this._inputAccInfo.ariaDescribedBy ? "".concat(this.suggestionsTextId, " ").concat(this.valueStateTextId, " ").concat(this._id, "-suggestionsCount ").concat(this._inputAccInfo.ariaDescribedBy).trim() : "".concat(this.suggestionsTextId, " ").concat(this.valueStateTextId, " ").concat(this._id, "-suggestionsCount").trim();
	      return {
	        "wrapper": {},
	        "input": {
	          "ariaDescribedBy": ariaDescribedBy,
	          "ariaInvalid": this.valueState === __chunk_21.ValueState.Error ? "true" : undefined,
	          "ariaHasPopup": this._inputAccInfo.ariaHasPopup ? this._inputAccInfo.ariaHasPopup : ariaHasPopupDefault,
	          "ariaAutoComplete": this._inputAccInfo.ariaAutoComplete ? this._inputAccInfo.ariaAutoComplete : ariaAutoCompleteDefault,
	          "role": this._inputAccInfo && this._inputAccInfo.role,
	          "ariaOwns": this._inputAccInfo && this._inputAccInfo.ariaOwns,
	          "ariaExpanded": this._inputAccInfo && this._inputAccInfo.ariaExpanded,
	          "ariaDescription": this._inputAccInfo && this._inputAccInfo.ariaDescription,
	          "ariaLabel": this._inputAccInfo && this._inputAccInfo.ariaLabel || __chunk_13.getEffectiveAriaLabelText(this),
	          "ariaRequired": this._inputAccInfo && this._inputAccInfo.ariaRequired || this.required
	        }
	      };
	    }
	  }, {
	    key: "ariaValueStateHiddenText",
	    get: function get() {
	      if (!this.hasValueStateMessage) {
	        return;
	      }

	      if (this.shouldDisplayDefaultValueStateMessage) {
	        return this.valueStateText;
	      }

	      return this.valueStateMessageText.map(function (el) {
	        return el.textContent;
	      }).join(" ");
	    }
	  }, {
	    key: "itemSelectionAnnounce",
	    get: function get() {
	      return this.Suggestions ? this.Suggestions.itemSelectionAnnounce : undefined;
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      return {
	        popoverValueState: {
	          "ui5-valuestatemessage-root": true,
	          "ui5-responsive-popover-header": !this.isOpen(),
	          "ui5-valuestatemessage--success": this.valueState === __chunk_21.ValueState.Success,
	          "ui5-valuestatemessage--error": this.valueState === __chunk_21.ValueState.Error,
	          "ui5-valuestatemessage--warning": this.valueState === __chunk_21.ValueState.Warning,
	          "ui5-valuestatemessage--information": this.valueState === __chunk_21.ValueState.Information
	        }
	      };
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return {
	        popoverHeader: {
	          "width": "".concat(this._inputWidth, "px")
	        },
	        suggestionPopoverHeader: {
	          "display": this._listWidth === 0 ? "none" : "inline-block",
	          "width": "".concat(this._listWidth, "px"),
	          "padding": "0.5625rem 1rem"
	        },
	        suggestionsPopover: {
	          "max-width": "".concat(this._inputWidth, "px")
	        }
	      };
	    }
	  }, {
	    key: "suggestionSeparators",
	    get: function get() {
	      return "None";
	    }
	  }, {
	    key: "valueStateMessageText",
	    get: function get() {
	      return this.getSlottedNodes("valueStateMessage").map(function (el) {
	        return el.cloneNode(true);
	      });
	    }
	  }, {
	    key: "shouldDisplayOnlyValueStateMessage",
	    get: function get() {
	      return this.hasValueStateMessage && !this.shouldOpenSuggestions() && this.focused;
	    }
	  }, {
	    key: "shouldDisplayDefaultValueStateMessage",
	    get: function get() {
	      return !this.valueStateMessage.length && this.hasValueStateMessage;
	    }
	  }, {
	    key: "hasValueState",
	    get: function get() {
	      return this.valueState !== __chunk_21.ValueState.None;
	    }
	  }, {
	    key: "hasValueStateMessage",
	    get: function get() {
	      return this.hasValueState && this.valueState !== __chunk_21.ValueState.Success && (!this._inputIconFocused // Handles the cases when valueStateMessage is forwarded (from datepicker e.g.)
	      || this._isPhone && this.Suggestions); // Handles Input with suggestions on mobile
	    }
	  }, {
	    key: "valueStateText",
	    get: function get() {
	      return this.valueStateTextMappings()[this.valueState];
	    }
	  }, {
	    key: "suggestionsText",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.INPUT_SUGGESTIONS);
	    }
	  }, {
	    key: "availableSuggestionsCount",
	    get: function get() {
	      if (this.showSuggestions) {
	        switch (this.suggestionsTexts.length) {
	          case 0:
	            return this.i18nBundle.getText(__chunk_5.INPUT_SUGGESTIONS_NO_HIT);

	          case 1:
	            return this.i18nBundle.getText(__chunk_5.INPUT_SUGGESTIONS_ONE_HIT);

	          default:
	            return this.i18nBundle.getText(__chunk_5.INPUT_SUGGESTIONS_MORE_HITS, this.suggestionsTexts.length);
	        }
	      }

	      return undefined;
	    }
	  }, {
	    key: "step",
	    get: function get() {
	      return this.type === InputType.Number ? "any" : undefined;
	    }
	  }, {
	    key: "_isPhone",
	    get: function get() {
	      return __chunk_10.isPhone();
	    }
	  }], [{
	    key: "onDefine",
	    value: function () {
	      var _onDefine = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee12() {
	        return regeneratorRuntime.wrap(function _callee12$(_context12) {
	          while (1) {
	            switch (_context12.prev = _context12.next) {
	              case 0:
	                _context12.next = 2;
	                return __chunk_1.fetchI18nBundle("@ui5/webcomponents");

	              case 2:
	              case "end":
	                return _context12.stop();
	            }
	          }
	        }, _callee12);
	      }));

	      function onDefine() {
	        return _onDefine.apply(this, arguments);
	      }

	      return onDefine;
	    }()
	  }, {
	    key: "dependencies",
	    get: function get() {
	      var Suggestions = __chunk_1.getFeature("InputSuggestions");
	      return [__chunk_26.Popover].concat(Suggestions ? Suggestions.dependencies : []);
	    }
	  }]);

	  return Input;
	}(__chunk_1.UI5Element);

	Input.define();

	exports.InputType = InputType;
	exports.Input = Input;

});
//# sourceMappingURL=chunk-f9a0bf68.js.map
