sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-1be5f319', './chunk-2e860beb', './chunk-b83f2514', './chunk-8b7daeae', './chunk-a1b7ce0b', './chunk-9647eaec'], function (__chunk_1, __chunk_2, __chunk_3, __chunk_5, __chunk_6, __chunk_7, __chunk_8, __chunk_9, __chunk_13, __chunk_14, __chunk_28, __chunk_40, __chunk_41) { 'use strict';

	/**
	 * @lends sap.ui.webcomponents.main.types.PanelAccessibleRole.prototype
	 * @public
	 */

	var PanelAccessibleRoles = {
	  /**
	   * Represents the ARIA role <code>complementary</code>. A section of the page, designed to be complementary to the main content at a similar level in the DOM hierarchy.
	   * @public
	   * @type {Complementary}
	   */
	  Complementary: "Complementary",

	  /**
	   * Represents the ARIA role <code>Form</code>. A landmark region that contains a collection of items and objects that, as a whole, create a form.
	   * @public
	   * @type {Form}
	   */
	  Form: "Form",

	  /**
	   * Represents the ARIA role <code>Region</code>. A section of a page, that is important enough to be included in a page summary or table of contents.
	   * @public
	   * @type {Region}
	   */
	  Region: "Region"
	};
	/**
	 * @class
	 * Available Panel Accessible Landmark Roles.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.PanelAccessibleRole
	 * @public
	 * @enum {string}
	 */

	var PanelAccessibleRole =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(PanelAccessibleRole, _DataType);

	  function PanelAccessibleRole() {
	    __chunk_1._classCallCheck(this, PanelAccessibleRole);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(PanelAccessibleRole).apply(this, arguments));
	  }

	  __chunk_1._createClass(PanelAccessibleRole, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!PanelAccessibleRoles[value];
	    }
	  }]);

	  return PanelAccessibleRole;
	}(__chunk_1.DataType);

	PanelAccessibleRole.generataTypeAcessors(PanelAccessibleRoles);

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div id=\"", "-header-title\" role=\"heading\" aria-level=\"", "\" class=\"ui5-panel-header-title\">", "</div>"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<slot name=\"header\"></slot>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-panel-header-button-root\"><ui5-button design=\"Transparent\" class=\"ui5-panel-header-button ", "\" icon=\"navigation-right-arrow\" ?non-focusable=\"", "\" @click=\"", "\" ._buttonAccInfo=\"", "\" aria-label=\"", "\" aria-labelledby=\"", "\"></ui5-button></div>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div data-sap-ui-fastnavgroup=\"true\" class=\"ui5-panel-root\" role=\"", "\"><!-- header: either header or h1 with header text --><div @click=\"", "\" @keydown=\"", "\" @keyup=\"", "\" class=\"ui5-panel-header\" tabindex=\"", "\" role=\"", "\" aria-expanded=\"", "\" aria-controls=\"", "\" aria-label=\"", "\" aria-labelledby=\"", "\">", "", "</div><!-- content area --><div class=\"ui5-panel-content\" id=\"", "-content\" tabindex=\"-1\" style=\"", "\"><slot></slot></div></div>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.ifDefined(context.accRole), context._headerClick, context._headerKeyDown, context._headerKeyUp, __chunk_2.ifDefined(context.headerTabIndex), __chunk_2.ifDefined(context.accInfo.role), __chunk_2.ifDefined(context.accInfo.ariaExpanded), __chunk_2.ifDefined(context.accInfo.ariaControls), __chunk_2.ifDefined(context.accInfo.ariaLabel), __chunk_2.ifDefined(context.accInfo.ariaLabelledby), !context.fixed ? block1(context) : undefined, context._hasHeader ? block2(context) : block3(context), __chunk_2.ifDefined(context._id), __chunk_2.styleMap(context.styles.content));
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), __chunk_2.classMap(context.classes.headerBtn), context.nonFocusableButton, context._toggleButtonClick, __chunk_2.ifDefined(context.accInfo.button), __chunk_2.ifDefined(context.accInfo.ariaLabelButton), __chunk_2.ifDefined(context.accInfo.ariaLabelledbyButton));
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3());
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.headerAriaLevel), __chunk_2.ifDefined(context.headerText));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var panelCss = ":host(:not([hidden])){display:block}:host{font-family:var(--sapFontFamily);background-color:var(--sapGroup_ContentBackground)}:host([collapsed]) .ui5-panel-header,:host([fixed]) .ui5-panel-header{border-bottom:1px solid var(--sapGroup_TitleBorderColor)}:host([fixed]) .ui5-panel-header{padding-left:1rem}.ui5-panel-header{height:var(--_ui5_panel_header_height);width:100%;display:flex;justify-content:flex-start;align-items:center;outline:none;box-sizing:border-box;padding-right:1rem;padding-left:.25rem;border-bottom:1px solid transparent}.ui5-panel-header-button-animated{transition:transform .4s ease-out}:host(:not([_has-header])) .ui5-panel-header-button{pointer-events:none}:host(:not([_has-header]):not([fixed])){cursor:pointer}:host(:not([_has-header]):not([fixed])) .ui5-panel-header:focus{outline:var(--_ui5_panel_focus_border);outline-offset:-3px}:host(:not([collapsed])) .ui5-panel-header-button{transform:rotate(90deg)}:host([fixed]) .ui5-panel-header-title{width:100%}.ui5-panel-header-title{width:calc(100% - var(--_ui5_panel_button_root_width));overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--sapFontHeaderFamily);font-size:var(--sapFontHeader5Size);font-weight:400;color:var(--sapGroup_TitleTextColor)}.ui5-panel-content{padding:.625rem 1rem 1.375rem 1rem;outline:none}.ui5-panel-header-button-root{display:flex;justify-content:center;align-items:center;flex-shrink:0;width:var(--_ui5_panel_button_root_width);margin-right:.25rem}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-panel",
	  languageAware: true,
	  managedSlots: true,
	  slots:
	  /** @lends sap.ui.webcomponents.main.Panel.prototype */
	  {
	    /**
	     * Defines the <code>ui5-panel</code> header area.
	     * <br><br>
	     * <b>Note:</b> When a header is provided, the <code>headerText</code> property is ignored.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    header: {
	      type: HTMLElement
	    },

	    /**
	     * Determines the content of the <code>ui5-panel</code>.
	     * The content is visible only when the <code>ui5-panel</code> is expanded.
	     *
	     * @type {Node[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      type: HTMLElement
	    }
	  },
	  properties:
	  /** @lends sap.ui.webcomponents.main.Panel.prototype */
	  {
	    /**
	     * This property is used to set the header text of the <code>ui5-panel</code>.
	     * The text is visible in both expanded and collapsed states.
	     * <br><br>
	     * <b>Note:</b> This property is overridden by the <code>header</code> slot.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    headerText: {
	      type: String
	    },

	    /**
	     * Determines whether the <code>ui5-panel</code> is in a fixed state that is not
	     * expandable/collapsible by user interaction.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    fixed: {
	      type: Boolean
	    },

	    /**
	     * Indicates whether the <code>ui5-panel</code> is collapsed and only the header is displayed.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    collapsed: {
	      type: Boolean
	    },

	    /**
	     * Sets the accessible aria role of the <code>ui5-panel</code>.
	     * Depending on the usage, you can change the role from the default <code>Form</code>
	     * to <code>Region</code> or <code>Complementary</code>.
	     *
	     * @type {PanelAccessibleRole}
	     * @defaultvalue "Form"
	     * @public
	     */
	    accessibleRole: {
	      type: PanelAccessibleRole,
	      defaultValue: PanelAccessibleRole.Form
	    },

	    /**
	     * Defines the "aria-level" of <code>ui5-panel</code> heading,
	     * set by the <code>headerText</code>.
	     * <br><br>
	     * Available options are: <code>"H6"</code> to <code>"H1"</code>.
	     * @type {TitleLevel}
	     * @defaultvalue "H2"
	     * @public
	    */
	    headerLevel: {
	      type: __chunk_28.TitleLevel,
	      defaultValue: __chunk_28.TitleLevel.H2
	    },

	    /**
	     * @type {String}
	     * @defaultvalue ""
	     * @private
	     * @since 1.0.0-rc.8
	     */
	    ariaLabel: {
	      type: String
	    },

	    /**
	     * Receives id(or many ids) of the elements that label the panel
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
	    _hasHeader: {
	      type: Boolean
	    },
	    _header: {
	      type: Object
	    },
	    _contentExpanded: {
	      type: Boolean,
	      noAttribute: true
	    },
	    _animationRunning: {
	      type: Boolean,
	      noAttribute: true
	    },
	    _buttonAccInfo: {
	      type: Object
	    }
	  },
	  events: {
	    /**
	     * Fired when the ui5-panel is expanded/collapsed by user interaction.
	     *
	     * @event
	     * @public
	     */
	    toggle: {}
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-panel</code> component is a container which has a header and a
	 * content area and is used
	 * for grouping and displaying information. It can be collapsed to save space on the screen.
	 *
	 * <h3>Guidelines:</h3>
	 * <ul>
	 * <li>Nesting two or more panels is not recommended.</li>
	 * <li>Do not stack too many panels on one page.</li>
	 * </ul>
	 *
	 * <h3>Structure</h3>
	 * A panel consists of a title bar with a header text or custom header.
	 * <br>
	 * The content area can contain an arbitrary set of controls.
	 * The header is clickable and can be used to toggle between the expanded and collapsed state.
	 * It includes an icon which rotates depending on the state.
	 * <br>
	 * The custom header can be set through the <code>header</code> slot and it may contain arbitraray content, such as: title, buttons or any other HTML elements.
	 * <br><b>Note:</b> the custom header is not clickable out of the box, but in this case the icon is interactive and allows to show/hide the content area.
	 *
	 * <h3>Responsive Behavior</h3>
	 * <ul>
	 * <li>If the width of the panel is set to 100% (default), the panel and its children are
	 * resized responsively,
	 * depending on its parent container.</li>
	 * <li>If the panel has a fixed height, it will take up the space even if the panel is
	 * collapsed.</li>
	 * <li>When the panel is expandable (the <code>fixed</code> property is set to <code>false</code>),
	 * an arrow icon (pointing to the right) appears in front of the header.</li>
	 * <li>When the animation is activated, expand/collapse uses a smooth animation to open or
	 * close the content area.</li>
	 * <li>When the panel expands/collapses, the arrow icon rotates 90 degrees
	 * clockwise/counter-clockwise.</li>
	 * </ul>
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/Panel";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Panel
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-panel
	 * @public
	 */

	var Panel =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Panel, _UI5Element);

	  __chunk_1._createClass(Panel, null, [{
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
	    key: "styles",
	    get: function get() {
	      return panelCss;
	    }
	  }]);

	  function Panel() {
	    var _this;

	    __chunk_1._classCallCheck(this, Panel);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Panel).call(this));
	    _this._header = {};
	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    return _this;
	  }

	  __chunk_1._createClass(Panel, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      // If the animation is running, it will set the content expanded state at the end
	      if (!this._animationRunning) {
	        this._contentExpanded = !this.collapsed;
	      }

	      this._hasHeader = !!this.header.length;
	    }
	  }, {
	    key: "shouldToggle",
	    value: function shouldToggle(node) {
	      var customContent = this.header.length;

	      if (customContent) {
	        return node.classList.contains("ui5-panel-header-button");
	      }

	      return true;
	    }
	  }, {
	    key: "shouldAnimate",
	    value: function shouldAnimate() {
	      return __chunk_40.getAnimationMode() !== __chunk_40.AnimationMode.None;
	    }
	  }, {
	    key: "_headerClick",
	    value: function _headerClick(event) {
	      if (!this.shouldToggle(event.target)) {
	        return;
	      }

	      this._toggleOpen();
	    }
	  }, {
	    key: "_toggleButtonClick",
	    value: function _toggleButtonClick(event) {
	      if (event.x === 0 && event.y === 0) {
	        event.stopImmediatePropagation();
	      }
	    }
	  }, {
	    key: "_headerKeyDown",
	    value: function _headerKeyDown(event) {
	      if (!this.shouldToggle(event.target)) {
	        return;
	      }

	      if (__chunk_8.isEnter(event)) {
	        this._toggleOpen();
	      }

	      if (__chunk_8.isSpace(event)) {
	        event.preventDefault();
	      }
	    }
	  }, {
	    key: "_headerKeyUp",
	    value: function _headerKeyUp(event) {
	      if (!this.shouldToggle(event.target)) {
	        return;
	      }

	      if (__chunk_8.isSpace(event)) {
	        this._toggleOpen();
	      }
	    }
	  }, {
	    key: "_toggleOpen",
	    value: function _toggleOpen() {
	      var _this2 = this;

	      if (this.fixed) {
	        return;
	      }

	      this.collapsed = !this.collapsed;

	      if (!this.shouldAnimate()) {
	        this.fireEvent("toggle");
	        return;
	      }

	      this._animationRunning = true;
	      var elements = this.getDomRef().querySelectorAll(".ui5-panel-content");
	      var animations = [];
	      [].forEach.call(elements, function (oElement) {
	        if (_this2.collapsed) {
	          animations.push(__chunk_40.slideUp({
	            element: oElement
	          }).promise());
	        } else {
	          animations.push(__chunk_40.slideDown({
	            element: oElement
	          }).promise());
	        }
	      });
	      Promise.all(animations).then(function (_) {
	        _this2._animationRunning = false;
	        _this2._contentExpanded = !_this2.collapsed;

	        _this2.fireEvent("toggle");
	      });
	    }
	  }, {
	    key: "_headerOnTarget",
	    value: function _headerOnTarget(target) {
	      return target.classList.contains("sapMPanelWrappingDiv");
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      return {
	        headerBtn: {
	          "ui5-panel-header-button-animated": this.shouldAnimate()
	        }
	      };
	    }
	  }, {
	    key: "toggleButtonTitle",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.PANEL_ICON);
	    }
	  }, {
	    key: "expanded",
	    get: function get() {
	      return !this.collapsed;
	    }
	  }, {
	    key: "accRole",
	    get: function get() {
	      return this.accessibleRole.toLowerCase();
	    }
	  }, {
	    key: "accInfo",
	    get: function get() {
	      return {
	        "button": {
	          "ariaExpanded": this._hasHeader ? this.expanded : undefined,
	          "ariaControls": this._hasHeader ? "".concat(this._id, "-content") : undefined,
	          "title": this.toggleButtonTitle
	        },
	        "ariaExpanded": this.nonFixedInternalHeader ? this.expanded : undefined,
	        "ariaControls": this.nonFixedInternalHeader ? "".concat(this._id, "-content") : undefined,
	        "ariaLabelledby": this.nonFocusableButton ? this.ariaLabelledbyReference : undefined,
	        "ariaLabel": this.nonFocusableButton ? this.ariaLabelTxt : undefined,
	        "ariaLabelledbyButton": this.nonFocusableButton ? undefined : this.ariaLabelledbyReference,
	        "ariaLabelButton": this.nonFocusableButton ? undefined : this.ariaLabelTxt,
	        "role": this.nonFixedInternalHeader ? "button" : undefined
	      };
	    }
	  }, {
	    key: "ariaLabelledbyReference",
	    get: function get() {
	      if (this.ariaLabelledby || this.ariaLabel) {
	        return undefined;
	      }

	      return this.nonFocusableButton && this.headerText ? "".concat(this._id, "-header-title") : undefined;
	    }
	  }, {
	    key: "ariaLabelTxt",
	    get: function get() {
	      return __chunk_13.getEffectiveAriaLabelText(this);
	    }
	  }, {
	    key: "headerAriaLevel",
	    get: function get() {
	      return this.headerLevel.slice(1);
	    }
	  }, {
	    key: "headerTabIndex",
	    get: function get() {
	      return this.header.length || this.fixed ? "-1" : "0";
	    }
	  }, {
	    key: "nonFixedInternalHeader",
	    get: function get() {
	      return !this._hasHeader && !this.fixed;
	    }
	  }, {
	    key: "nonFocusableButton",
	    get: function get() {
	      return !this.header.length;
	    }
	  }, {
	    key: "shouldRenderH1",
	    get: function get() {
	      return !this.header.length && (this.headerText || !this.fixed);
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return {
	        content: {
	          display: this._contentExpanded ? "block" : "none"
	        }
	      };
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
	      return [__chunk_14.Button];
	    }
	  }]);

	  return Panel;
	}(__chunk_1.UI5Element);

	Panel.define();

	return Panel;

});
//# sourceMappingURL=Panel.js.map
