sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-1be5f319', './chunk-2e860beb'], function (exports, __chunk_1, __chunk_2, __chunk_3, __chunk_5, __chunk_6, __chunk_7, __chunk_8, __chunk_9, __chunk_13) { 'use strict';

	/**
	 * @lends sap.ui.webcomponents.main.types.ButtonDesign.prototype
	 * @public
	 */

	var ButtonTypes = {
	  /**
	   * default type (no special styling)
	   * @public
	   * @type {Default}
	   */
	  Default: "Default",

	  /**
	   * accept type (green button)
	   * @public
	   * @type {Positive}
	   */
	  Positive: "Positive",

	  /**
	   * reject style (red button)
	   * @public
	   * @type {Negative}
	   */
	  Negative: "Negative",

	  /**
	   * transparent type
	   * @public
	   * @type {Transparent}
	   */
	  Transparent: "Transparent",

	  /**
	   * emphasized type
	   * @public
	   * @type {Emphasized}
	   */
	  Emphasized: "Emphasized"
	};
	/**
	 * @class
	 * Different types of Button.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.ButtonDesign
	 * @public
	 * @enum {string}
	 */

	var ButtonDesign =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(ButtonDesign, _DataType);

	  function ButtonDesign() {
	    __chunk_1._classCallCheck(this, ButtonDesign);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ButtonDesign).apply(this, arguments));
	  }

	  __chunk_1._createClass(ButtonDesign, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!ButtonTypes[value];
	    }
	  }]);

	  return ButtonDesign;
	}(__chunk_1.DataType);

	ButtonDesign.generataTypeAcessors(ButtonTypes);

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-hidden-text\">", "</span>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-icon style=\"", "\" class=\"ui5-button-icon\" name=\"", "\" show-tooltip=", "></ui5-icon>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<button type=\"button\" class=\"ui5-button-root\" ?disabled=\"", "\" data-sap-focus-ref  dir=\"", "\" @focusout=", " @focusin=", " @click=", " @mousedown=", " @mouseup=", " @keydown=", " @keyup=", " tabindex=", " aria-expanded=\"", "\" aria-controls=\"", "\" aria-haspopup=\"", "\" aria-label=\"", "\" title=\"", "\" part=\"button\">", "<span id=\"", "-content\" class=\"ui5-button-text\"><bdi><slot></slot></bdi></span>", "</button> "]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), context.disabled, __chunk_2.ifDefined(context.effectiveDir), context._onfocusout, context._onfocusin, context._onclick, context._onmousedown, context._onmouseup, context._onkeydown, context._onkeyup, __chunk_2.ifDefined(context.tabIndexValue), __chunk_2.ifDefined(context.accInfo.ariaExpanded), __chunk_2.ifDefined(context.accInfo.ariaControls), __chunk_2.ifDefined(context.accInfo.ariaHaspopup), __chunk_2.ifDefined(context.ariaLabelText), __chunk_2.ifDefined(context.accInfo.title), context.icon ? block1(context) : undefined, __chunk_2.ifDefined(context._id), context.hasButtonType ? block2(context) : undefined);
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), __chunk_2.styleMap(context.styles.icon), __chunk_2.ifDefined(context.icon), __chunk_2.ifDefined(context.iconOnly));
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(context.buttonTypeText));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var buttonCss = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:0;top:0}:host(:not([hidden])){display:inline-block}:host{min-width:var(--_ui5_button_base_min_width);height:var(--_ui5_button_base_height);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);text-shadow:var(--_ui5_button_text_shadow);border-radius:var(--_ui5_button_border_radius);border-width:.0625rem;cursor:pointer;background-color:var(--sapButton_Background);border:1px solid var(--sapButton_BorderColor);color:var(--sapButton_TextColor);box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}:host([has-icon]) button[dir=rtl].ui5-button-root .ui5-button-text{margin-right:var(--_ui5_button_base_icon_margin);margin-left:0}:host([has-icon][icon-end]) button[dir=rtl].ui5-button-root .ui5-button-icon{margin-right:var(--_ui5_button_base_icon_margin);margin-left:0}.ui5-button-root{min-width:inherit;cursor:inherit;height:100%;width:100%;box-sizing:border-box;display:flex;justify-content:center;align-items:center;outline:none;padding:0 var(--_ui5_button_base_padding);position:relative;background:transparent;border:none;color:inherit;text-shadow:inherit;font:inherit;white-space:inherit;overflow:inherit;text-overflow:inherit;letter-spacing:inherit;word-spacing:inherit;line-height:inherit}:host(:not([active]):hover),:host(:not([hidden]).ui5_hovered){background:var(--sapButton_Hover_Background)}.ui5-button-icon{color:inherit;flex-shrink:0}:host([icon-end]) .ui5-button-root{flex-direction:row-reverse}:host([icon-end]) .ui5-button-icon{margin-left:var(--_ui5_button_base_icon_margin)}:host([icon-only]) .ui5-button-root{min-width:auto;padding:0}:host([icon-only]) .ui5-button-text{display:none}.ui5-button-text{outline:none;position:relative;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([has-icon]:not([icon-end])) .ui5-button-text{margin-left:var(--_ui5_button_base_icon_margin)}:host([has-icon][icon-end]) .ui5-button-text{margin-left:0}:host([disabled]){opacity:.5;pointer-events:none}:host([focused]){outline:var(--_ui5_button_outline);outline-offset:var(--_ui5_button_outline_offset)}.ui5-button-root::-moz-focus-inner{border:0}bdi{display:block;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([active]:not([disabled])){background-image:none;background-color:var(--sapButton_Active_Background);border-color:var(--_ui5_button_active_border_color);color:var(--sapButton_Active_TextColor);text-shadow:none}:host([active]){outline-color:var(--sapContent_ContrastFocusColor)}:host([design=Positive]){background-color:var(--sapButton_Accept_Background);border-color:var(--_ui5_button_positive_border_color);color:var(--sapButton_Accept_TextColor);text-shadow:var(--_ui5_button_text_shadow)}:host([design=Positive]:hover){background-color:var(--sapButton_Accept_Hover_Background);border-color:var(--_ui5_button_positive_border_hover_color)}:host([design=Positive][active]){background-color:var(--sapButton_Accept_Active_Background);border-color:var(--_ui5_button_positive_border_active_color);color:var(--sapButton_Active_TextColor);text-shadow:none}:host([design=Positive][focused]){outline-color:var(--_ui5_button_positive_border_focus_hover_color);border-color:var(--_ui5_button_positive_focus_border_color)}:host([design=Positive][active][focused]){outline-color:var(--sapContent_ContrastFocusColor)}:host([design=Negative]){background-color:var(--sapButton_Reject_Background);border-color:var(--sapButton_Reject_BorderColor);color:var(--sapButton_Reject_TextColor);text-shadow:var(--_ui5_button_text_shadow)}:host([design=Negative]:hover){background-color:var(--sapButton_Reject_Hover_Background);border-color:var(--sapButton_Reject_Hover_BorderColor)}:host([design=Negative][focused]){border-color:var(--_ui5_button_negative_focus_border_color);outline-color:var(--_ui5_button_positive_border_focus_hover_color)}:host([design=Negative][active]){background-color:var(--sapButton_Reject_Active_Background);border-color:var(--_ui5_button_negative_active_border_color);color:var(--sapButton_Active_TextColor);text-shadow:none}:host([design=Negative][active][focused]){outline-color:var(--sapContent_ContrastFocusColor)}:host([design=Emphasized]){background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor);color:var(--sapButton_Emphasized_TextColor);text-shadow:0 0 .125rem var(--sapButton_Emphasized_TextShadow);font-weight:var(--_ui5_button_emphasized_font_weight)}:host([design=Emphasized]:not([active]):hover){background-color:var(--sapButton_Emphasized_Hover_Background);border-color:var(--sapButton_Emphasized_Hover_BorderColor)}:host([design=Empasized][active]){background-color:var(--sapButton_Emphasized_Active_Background);border-color:var(--sapButton_Emphasized_Active_BorderColor);color:var(--sapButton_Active_TextColor);text-shadow:none}:host([design=Emphasized][focused]){outline-color:var(--sapContent_ContrastFocusColor);border-color:var(--_ui5_button_emphasized_focused_border_color)}:host([design=Transparent]){background-color:var(--sapButton_Lite_Background);color:var(--sapButton_Lite_TextColor);text-shadow:var(--_ui5_button_text_shadow);border-color:var(--_ui5_button_transparent_border_color)}:host([design=Transparent]):hover{background-color:var(--sapButton_Lite_Hover_Background)}:host([design=Transparent][active]){background-color:var(--sapButton_Active_Background);color:var(--sapButton_Active_TextColor);text-shadow:none}:host([design=Transparent]:not([active]):hover){border-color:var(--_ui5_button_transparent_hover_border_color)}[ui5-button][focused]{outline:none}[ui5-button][focused] .ui5-button-root{position:relative}[ui5-button][focused] .ui5-button-root:after{content:\"\";position:absolute;border-width:1px;border-style:dotted;border-color:var(--_ui5_button_focus_color);top:var(--_ui5_button_focus_offset);bottom:var(--_ui5_button_focus_offset);left:var(--_ui5_button_focus_offset);right:var(--_ui5_button_focus_offset)}[ui5-button][active] .ui5-button-root:after{border-color:var(--sapContent_ContrastFocusColor)}[ui5-button][design=Positive][focused] .ui5-button-root:after{border-color:var(--_ui5_button_positive_border_focus_hover_color)}[ui5-button][design=Positive][active][focused] .ui5-button-root:after{border-color:var(--sapContent_ContrastFocusColor)}[ui5-button][design=Negative][focused] .ui5-button-root:after{border-color:var(--_ui5_button_positive_border_focus_hover_color)}[ui5-button][design=Negative][active][focused] .ui5-button-root:after{border-color:var(--sapContent_ContrastFocusColor)}[ui5-button][design=Emphasized][focused] .ui5-button-root:after{border-color:var(--sapContent_ContrastFocusColor)}[ui5-button] [ui5-icon].ui5-button-icon{height:var(--_ui5_button_icon_font_size);top:0}";

	var isGlobalHandlerAttached = false;
	var activeButton = null;
	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-button",
	  languageAware: true,
	  properties:
	  /** @lends sap.ui.webcomponents.main.Button.prototype */
	  {
	    /**
	     * Defines the <code>ui5-button</code> design.
	     * <br><br>
	     * <b>Note:</b> Available options are "Default", "Emphasized", "Positive",
	     * "Negative", and "Transparent".
	     *
	     * @type {ButtonDesign}
	     * @defaultvalue "Default"
	     * @public
	     */
	    design: {
	      type: ButtonDesign,
	      defaultValue: ButtonDesign.Default
	    },

	    /**
	     * Defines whether the <code>ui5-button</code> is disabled
	     * (default is set to <code>false</code>).
	     * A disabled <code>ui5-button</code> can't be pressed or
	     * focused, and it is not in the tab chain.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    disabled: {
	      type: Boolean
	    },

	    /**
	     * Defines the icon to be displayed as graphical element within the <code>ui5-button</code>.
	     * The SAP-icons font provides numerous options.
	     * <br><br>
	     * Example:
	     * <br>
	     * <pre>ui5-button icon="palette"</pre>
	     *
	     * See all the available icons in the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    icon: {
	      type: String
	    },

	    /**
	     * Defines whether the icon should be displayed after the <code>ui5-button</code> text.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    iconEnd: {
	      type: Boolean
	    },

	    /**
	     * Defines the size of the icon inside the <code>ui5-button</code>.
	     *
	     * @type {string}
	     * @defaultvalue undefined
	     * @public
	     * @since 1.0.0-rc.8
	     */
	    iconSize: {
	      type: String,
	      defaultValue: undefined
	    },

	    /**
	     * When set to <code>true</code>, the <code>ui5-button</code> will
	     * automatically submit the nearest form element upon <code>press</code>.
	     * <br><br>
	     * <b>Important:</b> For the <code>submits</code> property to have effect, you must add the following import to your project:
	     * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    submits: {
	      type: Boolean
	    },

	    /**
	     * Used to switch the active state (pressed or not) of the <code>ui5-button</code>.
	     * @private
	     */
	    active: {
	      type: Boolean
	    },

	    /**
	     * Defines if a content has been added to the default slot
	     * @private
	     */
	    iconOnly: {
	      type: Boolean
	    },

	    /**
	     * Indicates if the elements is on focus
	     * @private
	     */
	    focused: {
	      type: Boolean
	    },

	    /**
	     * Indicates if the elements has a slotted icon
	     * @private
	     */
	    hasIcon: {
	      type: Boolean
	    },

	    /**
	     * Defines the aria-label attribute for the button
	     * @type {String}
	     * @defaultvalue: ""
	     * @private
	     * @since 1.0.0-rc.7
	     */
	    ariaLabel: {
	      type: String,
	      defaultValue: undefined
	    },

	    /**
	     * Receives id(or many ids) of the elements that label the button
	     * @type {String}
	     * @defaultvalue ""
	     * @private
	     * @since 1.0.0-rc.7
	     */
	    ariaLabelledby: {
	      type: String,
	      defaultValue: ""
	    },

	    /**
	     * @type {String}
	     * @defaultvalue ""
	     * @private
	     * @since 1.0.0-rc.8
	     */
	    ariaExpanded: {
	      type: String
	    },

	    /**
	     * Indicates if the element if focusable
	     * @private
	     */
	    nonFocusable: {
	      type: Boolean
	    },
	    _iconSettings: {
	      type: Object
	    },
	    _buttonAccInfo: {
	      type: Object
	    },

	    /**
	     * Defines the tabIndex of the component.
	     * @private
	     */
	    _tabIndex: {
	      type: String,
	      defaultValue: "0",
	      noAttribute: true
	    }
	  },
	  managedSlots: true,
	  slots:
	  /** @lends sap.ui.webcomponents.main.Button.prototype */
	  {
	    /**
	     * Defines the text of the <code>ui5-button</code>.
	     * <br><br>
	     * <b>Note:</b> Аlthough this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
	     *
	     * @type {Node[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      type: Node
	    }
	  },
	  events:
	  /** @lends sap.ui.webcomponents.main.Button.prototype */
	  {
	    /**
	     * Fired when the <code>ui5-button</code> is activated either with a
	     * mouse/tap or by using the Enter or Space key.
	     * <br><br>
	     * <b>Note:</b> The event will not be fired if the <code>disabled</code>
	     * property is set to <code>true</code>.
	     *
	     * @event
	     * @public
	     */
	    click: {}
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-button</code> component represents a simple push button.
	 * It enables users to trigger actions by clicking or tapping the <code>ui5-button</code>, or by pressing
	 * certain keyboard keys, such as Enter.
	 *
	 *
	 * <h3>Usage</h3>
	 *
	 * For the <code>ui5-button</code> UI, you can define text, icon, or both. You can also specify
	 * whether the text or the icon is displayed first.
	 * <br><br>
	 * You can choose from a set of predefined types that offer different
	 * styling to correspond to the triggered action.
	 * <br><br>
	 * You can set the <code>ui5-button</code> as enabled or disabled. An enabled
	 * <code>ui5-button</code> can be pressed by clicking or tapping it. The button changes
	 * its style to provide visual feedback to the user that it is pressed or hovered over with
	 * the mouse cursor. A disabled <code>ui5-button</code> appears inactive and cannot be pressed.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/Button";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Button
	 * @extends UI5Element
	 * @tagname ui5-button
	 * @public
	 */

	var Button =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Button, _UI5Element);

	  __chunk_1._createClass(Button, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return buttonCss;
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
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_9.Icon];
	    }
	  }]);

	  function Button() {
	    var _this;

	    __chunk_1._classCallCheck(this, Button);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Button).call(this));

	    _this._deactivate = function () {
	      if (activeButton) {
	        activeButton.active = false;
	      }
	    };

	    if (!isGlobalHandlerAttached) {
	      document.addEventListener("mouseup", _this._deactivate);
	      isGlobalHandlerAttached = true;
	    }

	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    return _this;
	  }

	  __chunk_1._createClass(Button, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      var FormSupport = __chunk_1.getFeature("FormSupport");

	      if (this.submits && !FormSupport) {
	        console.warn("In order for the \"submits\" property to have effect, you should also: import \"@ui5/webcomponents/dist/features/InputElementsFormSupport.js\";"); // eslint-disable-line
	      }

	      this.iconOnly = this.isIconOnly;
	      this.hasIcon = !!this.icon;
	    }
	  }, {
	    key: "_onclick",
	    value: function _onclick(event) {
	      event.isMarked = "button";
	      var FormSupport = __chunk_1.getFeature("FormSupport");

	      if (FormSupport) {
	        FormSupport.triggerFormSubmit(this);
	      }
	    }
	  }, {
	    key: "_onmousedown",
	    value: function _onmousedown(event) {
	      event.isMarked = "button";
	      this.active = true;
	      activeButton = this; // eslint-disable-line
	    }
	  }, {
	    key: "_onmouseup",
	    value: function _onmouseup(event) {
	      event.isMarked = "button";
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      event.isMarked = "button";

	      if (__chunk_8.isSpace(event) || __chunk_8.isEnter(event)) {
	        this.active = true;
	      }
	    }
	  }, {
	    key: "_onkeyup",
	    value: function _onkeyup(event) {
	      if (__chunk_8.isSpace(event) || __chunk_8.isEnter(event)) {
	        this.active = false;
	      }
	    }
	  }, {
	    key: "_onfocusout",
	    value: function _onfocusout(_event) {
	      this.active = false;
	      this.focused = false;
	    }
	  }, {
	    key: "_onfocusin",
	    value: function _onfocusin(event) {
	      event.isMarked = "button";
	      this.focused = true;
	    }
	  }, {
	    key: "hasButtonType",
	    get: function get() {
	      return this.design !== ButtonDesign.Default && this.design !== ButtonDesign.Transparent;
	    }
	  }, {
	    key: "isIconOnly",
	    get: function get() {
	      return !Array.from(this.childNodes).filter(function (node) {
	        return node.nodeType !== Node.COMMENT_NODE;
	      }).length;
	    }
	  }, {
	    key: "accInfo",
	    get: function get() {
	      return {
	        "ariaExpanded": this.ariaExpanded || this._buttonAccInfo && this._buttonAccInfo.ariaExpanded,
	        "ariaControls": this._buttonAccInfo && this._buttonAccInfo.ariaControls,
	        "ariaHaspopup": this._buttonAccInfo && this._buttonAccInfo.ariaHaspopup,
	        "title": this._buttonAccInfo && this._buttonAccInfo.title
	      };
	    }
	  }, {
	    key: "ariaLabelText",
	    get: function get() {
	      return __chunk_13.getEffectiveAriaLabelText(this);
	    }
	  }, {
	    key: "buttonTypeText",
	    get: function get() {
	      return this.i18nBundle.getText(Button.typeTextMappings()[this.design]);
	    }
	  }, {
	    key: "tabIndexValue",
	    get: function get() {
	      var tabindex = this.getAttribute("tabindex");

	      if (tabindex) {
	        return tabindex;
	      }

	      return this.nonFocusable ? "-1" : this._tabIndex;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return {
	        icon: {
	          width: this.iconSize,
	          height: this.iconSize
	        }
	      };
	    }
	  }], [{
	    key: "typeTextMappings",
	    value: function typeTextMappings() {
	      return {
	        "Positive": __chunk_5.BUTTON_ARIA_TYPE_ACCEPT,
	        "Negative": __chunk_5.BUTTON_ARIA_TYPE_REJECT,
	        "Emphasized": __chunk_5.BUTTON_ARIA_TYPE_EMPHASIZED
	      };
	    }
	  }, {
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
	  }]);

	  return Button;
	}(__chunk_1.UI5Element);

	Button.define();

	exports.Button = Button;
	exports.ButtonDesign = ButtonDesign;

});
//# sourceMappingURL=chunk-b83f2514.js.map
