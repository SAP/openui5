sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-04be579f', './chunk-b83f2514', './chunk-1b10f44e', './chunk-35c756ba', './chunk-47035d43', './chunk-81e00f35', './chunk-c52baa5e'], function (exports, __chunk_1, __chunk_2, __chunk_6, __chunk_7, __chunk_10, __chunk_14, __chunk_15, __chunk_24, __chunk_26, __chunk_27, __chunk_29) { 'use strict';

	function _templateObject11() {
	  var data = __chunk_1._taggedTemplateLiteral(["<footer class=\"ui5-popup-footer-root\"><slot name=\"footer\"></slot></footer>"]);

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
	  var data = __chunk_1._taggedTemplateLiteral(["<h2 class=\"ui5-popup-header-text\">", "</h2>"]);

	  _templateObject9 = function _templateObject9() {
	    return data;
	  };

	  return data;
	}

	function _templateObject8() {
	  var data = __chunk_1._taggedTemplateLiteral(["<slot name=\"header\"></slot>"]);

	  _templateObject8 = function _templateObject8() {
	    return data;
	  };

	  return data;
	}

	function _templateObject7() {
	  var data = __chunk_1._taggedTemplateLiteral(["<header class=\"ui5-popup-header-root\" id=\"ui5-popup-header\">", "</header>"]);

	  _templateObject7 = function _templateObject7() {
	    return data;
	  };

	  return data;
	}

	function _templateObject6() {
	  var data = __chunk_1._taggedTemplateLiteral(["<section style=\"", "\" class=\"", "\" role=\"dialog\" aria-modal=\"", "\" aria-label=\"", "\" aria-labelledby=\"", "\"><span class=\"first-fe\" data-ui5-focus-trap tabindex=\"0\" @focusin=", "></span><span class=\"ui5-popover-arrow\" style=\"", "\"></span>", "<div style=\"", "\" class=\"", "\"  @scroll=\"", "\"><slot></slot></div>", "<span class=\"last-fe\" data-ui5-focus-trap tabindex=\"0\" @focusin=", "></span></section>"]);

	  _templateObject6 = function _templateObject6() {
	    return data;
	  };

	  return data;
	}

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["<header class=\"ui5-responsive-popover-header\"><ui5-title level=\"H5\" class=\"ui5-responsive-popover-header-text\">", "</ui5-title><ui5-button icon=\"decline\" design=\"Transparent\" @click=\"", "\"></ui5-button></header>"]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<slot slot=\"header\" name=\"header\"></slot>"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-dialog ?with-padding=", " stretch _disable-initial-focus @ui5-before-open=\"", "\" @ui5-after-open=\"", "\" @ui5-before-close=\"", "\" @ui5-after-close=\"", "\">", "<slot></slot><slot slot=\"footer\" name=\"footer\"></slot></ui5-dialog>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), context._isPhone ? block1(context) : block5(context));
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), context.withPadding, __chunk_2.ifDefined(context._propagateDialogEvent), __chunk_2.ifDefined(context._afterDialogOpen), __chunk_2.ifDefined(context._propagateDialogEvent), __chunk_2.ifDefined(context._afterDialogClose), !context._hideHeader ? block2(context) : undefined);
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), context.header.length ? block3(context) : block4(context));
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4());
	};

	var block4 = function block4(context) {
	  return __chunk_2.scopedHtml(_templateObject5(), __chunk_2.ifDefined(context.headerText), context.close);
	};

	var block5 = function block5(context) {
	  return __chunk_2.scopedHtml(_templateObject6(), __chunk_2.styleMap(context.styles.root), __chunk_2.classMap(context.classes.root), __chunk_2.ifDefined(context._ariaModal), __chunk_2.ifDefined(context._ariaLabel), __chunk_2.ifDefined(context._ariaLabelledBy), context.forwardToLast, __chunk_2.styleMap(context.styles.arrow), context._displayHeader ? block6(context) : undefined, __chunk_2.styleMap(context.styles.content), __chunk_2.classMap(context.classes.content), context._scroll, context._displayFooter ? block9(context) : undefined, context.forwardToFirst);
	};

	var block6 = function block6(context) {
	  return __chunk_2.scopedHtml(_templateObject7(), context.header.length ? block7(context) : block8(context));
	};

	var block7 = function block7(context) {
	  return __chunk_2.scopedHtml(_templateObject8());
	};

	var block8 = function block8(context) {
	  return __chunk_2.scopedHtml(_templateObject9(), __chunk_2.ifDefined(context.headerText));
	};

	var block9 = function block9(context) {
	  return __chunk_2.scopedHtml(_templateObject10(), context.footer.length ? block10(context) : undefined);
	};

	var block10 = function block10(context) {
	  return __chunk_2.scopedHtml(_templateObject11());
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var ResponsivePopoverCss = ":host{--_ui5_input_width:100%;min-width:6.25rem;min-height:2rem}:host(:not([with-padding])){--_ui5_popup_content_padding:0}:host([opened]){display:inline-block}.ui5-responsive-popover-header{height:var(--_ui5-responnsive_popover_header_height);display:flex;justify-content:space-between;align-items:center;padding:0 1rem;box-shadow:var(--sapContent_HeaderShadow)}:host [dir=rtl] .ui5-responsive-popover-header{padding:0 1rem 0 0}.ui5-responsive-popover-header-text{display:flex;align-items:center;width:calc(100% - var(--_ui5_button_base_min_width))}";

	var POPOVER_MIN_WIDTH = 100;
	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-responsive-popover",
	  properties:
	  /** @lends sap.ui.webcomponents.main.ResponsivePopover.prototype */
	  {
	    /**
	     * Defines whether the component will stretch to fit its content.
	     * <br/><b>Note:</b> by default the popover will be as wide as its opener component and will grow if the content is not fitting.
	     * <br/><b>Note:</b> if set to true, it will take only as much space as it needs.
	     * @private
	     */
	    noStretch: {
	      type: Boolean
	    },

	    /**
	     * Defines if padding would be added around the content.
	     * @private
	     */
	    withPadding: {
	      type: Boolean
	    },

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
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.ResponsivePopover
	 * @extends Popover
	 * @tagname ui5-responsive-popover
	 * @since 1.0.0-rc.6
	 * @public
	 */

	var ResponsivePopover =
	/*#__PURE__*/
	function (_Popover) {
	  __chunk_1._inherits(ResponsivePopover, _Popover);

	  function ResponsivePopover() {
	    __chunk_1._classCallCheck(this, ResponsivePopover);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ResponsivePopover).apply(this, arguments));
	  }

	  __chunk_1._createClass(ResponsivePopover, [{
	    key: "open",

	    /**
	     * Opens popover on desktop and dialog on mobile.
	     * @param {HTMLElement} opener the element that the popover is opened by
	     * @public
	     */
	    value: function open(opener) {
	      this.style.display = this._isPhone ? "contents" : "";

	      if (this.isOpen() || this._dialog && this._dialog.isOpen()) {
	        return;
	      }

	      if (!__chunk_10.isPhone()) {
	        // make popover width be >= of the opener's width
	        if (!this.noStretch) {
	          this._minWidth = Math.max(POPOVER_MIN_WIDTH, opener.getBoundingClientRect().width);
	        }

	        this.openBy(opener);
	      } else {
	        this.style.zIndex = __chunk_24.getNextZIndex();

	        this._dialog.open();
	      }
	    }
	    /**
	     * Closes the popover/dialog.
	     * @public
	     */

	  }, {
	    key: "close",
	    value: function close() {
	      var escPressed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	      var preventRegistryUpdate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	      var preventFocusRestore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	      if (!__chunk_10.isPhone()) {
	        __chunk_1._get(__chunk_1._getPrototypeOf(ResponsivePopover.prototype), "close", this).call(this, escPressed, preventRegistryUpdate, preventFocusRestore);
	      } else {
	        this._dialog.close();
	      }
	    }
	  }, {
	    key: "toggle",
	    value: function toggle(opener) {
	      if (this.isOpen()) {
	        return this.close();
	      }

	      this.open(opener);
	    }
	  }, {
	    key: "isOpen",
	    value: function isOpen() {
	      return __chunk_10.isPhone() ? this._dialog.isOpen() : __chunk_1._get(__chunk_1._getPrototypeOf(ResponsivePopover.prototype), "isOpen", this).call(this);
	    }
	  }, {
	    key: "_afterDialogOpen",
	    value: function _afterDialogOpen(event) {
	      this.opened = true;

	      this._propagateDialogEvent(event);
	    }
	  }, {
	    key: "_afterDialogClose",
	    value: function _afterDialogClose(event) {
	      this.opened = false;

	      this._propagateDialogEvent(event);
	    }
	  }, {
	    key: "_propagateDialogEvent",
	    value: function _propagateDialogEvent(event) {
	      var type = event.type.replace("ui5-", "");
	      this.fireEvent(type, event.detail);
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      var popoverStyles = __chunk_1._get(__chunk_1._getPrototypeOf(ResponsivePopover.prototype), "styles", this);

	      popoverStyles.root = {
	        "min-width": "".concat(this._minWidth, "px")
	      };
	      return popoverStyles;
	    }
	  }, {
	    key: "_dialog",
	    get: function get() {
	      return this.shadowRoot.querySelector("[ui5-dialog]");
	    }
	  }, {
	    key: "_isPhone",
	    get: function get() {
	      return __chunk_10.isPhone();
	    }
	  }, {
	    key: "_displayHeader",
	    get: function get() {
	      return this._isPhone || !this.contentOnlyOnDesktop;
	    }
	  }, {
	    key: "_displayFooter",
	    get: function get() {
	      return this._isPhone || !this.contentOnlyOnDesktop;
	    }
	  }], [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return [__chunk_26.Popover.styles, ResponsivePopoverCss];
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main;
	    }
	  }, {
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_14.Button, __chunk_27.Dialog, __chunk_29.Title];
	    }
	  }]);

	  return ResponsivePopover;
	}(__chunk_26.Popover);

	ResponsivePopover.define();

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var ResponsivePopoverCommonCss = ".input-root-phone{flex:1;height:var(--_ui5_input_height);color:var(--sapField_TextColor);font-size:var(--sapFontSize);font-family:var(--sapFontFamily);background-color:var(--sapField_Background);border:1px solid var(--sapField_BorderColor);border-radius:var(--_ui5_input_wrapper_border_radius);box-sizing:border-box}.input-root-phone [inner-input]{padding:0 .5rem;width:100%;height:100%}.input-root-phone[value-state]:not([value-state=None])[focused]{outline:var(--_ui5_input_focus_border_width) dotted var(--sapContent_FocusColor);outline-offset:-4px}.input-root-phone [value-state=Error] [input-icon][data-ui5-compact-size],.input-root-phone [value-state=Success] [input-icon][data-ui5-compact-size],.input-root-phone [value-state=Warning] [input-icon][data-ui5-compact-size]{padding:.1875rem .5rem}[inner-input]{background:transparent;color:inherit;border:none;font-style:normal;-webkit-appearance:none;-moz-appearance:textfield;line-height:normal;padding:var(--_ui5_input_inner_padding);box-sizing:border-box;min-width:3rem;text-overflow:ellipsis;flex:1;outline:none;font-size:inherit;font-family:inherit}[inner-input]::-moz-selection,[inner-input]::selection{background:var(--sapSelected);color:var(--sapContent_contrastTextColor)}[inner-input]::-webkit-input-placeholder{font-style:italic;color:var(--sapField_PlaceholderTextColor)}[inner-input]::-moz-placeholder{font-style:italic;color:var(--sapField_PlaceholderTextColor)}[inner-input]:-ms-input-placeholder{font-style:italic;color:var(--sapField_PlaceholderTextColor)}.input-root-phone[value-state]:not([value-state=None]){border-width:var(--_ui5_input_state_border_width)}.input-root-phone[value-state=Error] [inner-input],.input-root-phone[value-state=Warning] [inner-input]{font-style:var(--_ui5_input_error_warning_font_style)}.input-root-phone[value-state=Error] [inner-input]{font-weight:var(--_ui5_input_error_font_weight)}.input-root-phone[value-state=Error]:not([readonly]){background-color:var(--sapField_InvalidBackground);border-color:var(--sapField_InvalidColor)}.input-root-phone[value-state=Error]:not([readonly]):not([disabled]),.input-root-phone[value-state=Warning]:not([readonly]):not([disabled]){border-style:var(--_ui5_input_error_warning_border_style)}.input-root-phone[value-state=Warning]:not([readonly]){background-color:var(--sapField_WarningBackground);border-color:var(--sapField_WarningColor)}.input-root-phone[value-state=Success]:not([readonly]){background-color:var(--sapField_SuccessBackground);border-color:var(--sapField_SuccessColor)}[inner-input]::-ms-clear{height:0;width:0}.ui5-multi-combobox-toggle-button{margin-left:.5rem}.ui5-responsive-popover-header{width:100%;min-height:2.5rem;display:flex;flex-direction:column}.ui5-responsive-popover-header .row{box-sizing:border-box;padding:.25rem 1rem;min-height:2.5rem;display:flex;justify-content:center;align-items:center;font-size:var(--sapFontHeader5Size)}.ui5-responsive-popover-footer{display:flex;justify-content:flex-end;padding:.25rem;width:100%}.ui5-responsive-popover-close-btn{position:absolute;right:1rem}";

	exports.ResponsivePopoverCommonCss = ResponsivePopoverCommonCss;
	exports.ResponsivePopover = ResponsivePopover;

});
//# sourceMappingURL=chunk-390485da.js.map
