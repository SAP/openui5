sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c'], function (exports, __chunk_1, __chunk_2, __chunk_3, __chunk_6, __chunk_7, __chunk_8) { 'use strict';

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["", "<g role=\"presentation\"><path transform=\"translate(0, 512) scale(1, -1)\" d=\"", "\"/></g>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<title id=\"", "-tooltip\">", "</title>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<svg class=\"ui5-icon-root\" tabindex=\"", "\" dir=\"", "\" viewBox=\"0 0 512 512\" role=\"", "\" focusable=\"false\" preserveAspectRatio=\"xMidYMid meet\" aria-label=\"", "\" xmlns=\"http://www.w3.org/2000/svg\" @focusin=", " @focusout=", " @keydown=", " @keyup=", " @click=", ">", "</svg>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.ifDefined(context.tabIndex), __chunk_2.ifDefined(context._dir), __chunk_2.ifDefined(context.role), __chunk_2.ifDefined(context.accessibleNameText), context._onfocusin, context._onfocusout, context._onkeydown, context._onkeyup, context._onclick, blockSVG1(context));
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedSvg(_templateObject2(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.accessibleNameText));
	};

	var blockSVG1 = function blockSVG1(context) {
	  return __chunk_2.scopedSvg(_templateObject3(), context.hasIconTooltip ? block1(context) : undefined, __chunk_2.ifDefined(context.pathData));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var iconCss = ":host(:not([hidden])){display:inline-block}:host([invalid]){display:none}:host(:not([hidden]).ui5_hovered){opacity:.7}:host{width:1rem;height:1rem;color:var(--sapContent_NonInteractiveIconColor);fill:currentColor;outline:none}:host([interactive][focused]) .ui5-icon-root{outline:1px dotted var(--sapContent_FocusColor)}:host(:not([dir=ltr])) .ui5-icon-root[dir=rtl]{transform:scale(-1);transform-origin:center}.ui5-icon-root{display:flex;transform:scaleY(-1);transform-origin:center;outline:none}";

	var ICON_NOT_FOUND = "ICON_NOT_FOUND";
	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-icon",
	  languageAware: true,
	  properties:
	  /** @lends sap.ui.webcomponents.main.Icon.prototype */
	  {
	    /**
	     * Defines if the icon is interactive (focusable and pressable)
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     * @since 1.0.0-rc.8
	     */
	    interactive: {
	      type: Boolean
	    },

	    /**
	     * Defines the unique identifier (icon name) of each <code>ui5-icon</code>.
	     * <br><br>
	     * To browse all available icons, see the
	     * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
	     * <br><br>
	     * Example:
	     * <br>
	     * <code>name='add'</code>, <code>name='delete'</code>, <code>name='employee'</code>.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	    */
	    name: {
	      type: String
	    },

	    /**
	     * Defines the text alternative of the <code>ui5-icon</code>.
	     * If not provided a default text alternative will be set, if present.
	     * <br><br>
	     * <b>Note:</b> Every icon should have a text alternative in order to
	     * calculate its accessible name.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    accessibleName: {
	      type: String
	    },

	    /**
	     * Defines whether the <code>ui5-icon</code> should have a tooltip.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    showTooltip: {
	      type: Boolean
	    },

	    /**
	     * @private
	     */
	    pathData: {
	      type: String,
	      noAttribute: true
	    },

	    /**
	     * @private
	     */
	    accData: {
	      type: Object,
	      noAttribute: true
	    },

	    /**
	     * @private
	     */
	    focused: {
	      type: Boolean
	    },

	    /**
	    * @private
	    */
	    invalid: {
	      type: Boolean
	    }
	  },
	  events: {
	    /**
	     * Fired on mouseup, space and enter if icon is interactive
	     * @private
	     * @since 1.0.0-rc.8
	     */
	    click: {}
	  }
	};
	/**
	 * @class
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-icon</code> component represents an SVG icon.
	 * There are two main scenarios how the <code>ui5-icon</code> component is used:
	 * as a purely decorative element; or as a visually appealing clickable area in the form of an icon button.
	 * <br><br>
	 * A large set of built-in icons is available
	 * and they can be used by setting the <code>name</code> property on the <code>ui5-icon</code>.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/Icon.js";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Icon
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-icon
	 * @public
	 */

	var Icon =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Icon, _UI5Element);

	  function Icon() {
	    var _this;

	    __chunk_1._classCallCheck(this, Icon);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Icon).call(this));
	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    return _this;
	  }

	  __chunk_1._createClass(Icon, [{
	    key: "_onfocusin",
	    value: function _onfocusin(event) {
	      if (this.interactive) {
	        this.focused = true;
	      }
	    }
	  }, {
	    key: "_onfocusout",
	    value: function _onfocusout(event) {
	      this.focused = false;
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (this.interactive && __chunk_8.isEnter(event)) {
	        this.fireEvent("click");
	      }
	    }
	  }, {
	    key: "_onkeyup",
	    value: function _onkeyup(event) {
	      if (this.interactive && __chunk_8.isSpace(event)) {
	        this.fireEvent("click");
	      }
	    }
	  }, {
	    key: "_onclick",
	    value: function _onclick(event) {
	      if (this.interactive) {
	        event.preventDefault(); // Prevent the native event and fire custom event because otherwise the noConfict event won't be thrown

	        this.fireEvent("click");
	      }
	    }
	  }, {
	    key: "onBeforeRendering",
	    value: function () {
	      var _onBeforeRendering = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee() {
	        var name, iconData;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                name = this.name;

	                if (name) {
	                  _context.next = 3;
	                  break;
	                }

	                return _context.abrupt("return", console.warn("Icon name property is required", this));

	              case 3:
	                iconData = __chunk_1.getIconDataSync(name);

	                if (iconData) {
	                  _context.next = 8;
	                  break;
	                }

	                _context.next = 7;
	                return __chunk_1.getIconData(name);

	              case 7:
	                iconData = _context.sent;

	              case 8:
	                if (!(iconData === ICON_NOT_FOUND)) {
	                  _context.next = 11;
	                  break;
	                }

	                this.invalid = true;
	                /* eslint-disable-next-line */

	                return _context.abrupt("return", console.warn("Required icon is not registered. You can either import the icon as a module in order to use it e.g. \"@ui5/webcomponents-icons/dist/icons/".concat(name.replace("sap-icon://", ""), ".js\", or setup a JSON build step and import \"@ui5/webcomponents-icons/dist/Assets.js\".")));

	              case 11:
	                if (iconData) {
	                  _context.next = 14;
	                  break;
	                }

	                this.invalid = true;
	                /* eslint-disable-next-line */

	                return _context.abrupt("return", console.warn("Required icon is not registered. Invalid icon name: ".concat(this.name)));

	              case 14:
	                this.pathData = iconData.pathData;
	                this.accData = iconData.accData;
	                this.ltr = iconData.ltr;

	              case 17:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function onBeforeRendering() {
	        return _onBeforeRendering.apply(this, arguments);
	      }

	      return onBeforeRendering;
	    }()
	  }, {
	    key: "onEnterDOM",
	    value: function () {
	      var _onEnterDOM = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee2() {
	        var _this2 = this;

	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                setTimeout(function () {
	                  _this2.constructor.removeGlobalStyle(); // remove the global style as Icon.css is already in place

	                }, 0);

	              case 1:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2);
	      }));

	      function onEnterDOM() {
	        return _onEnterDOM.apply(this, arguments);
	      }

	      return onEnterDOM;
	    }()
	  }, {
	    key: "_dir",
	    get: function get() {
	      if (!this.effectiveDir) {
	        return;
	      }

	      if (this.ltr) {
	        return "ltr";
	      }

	      return this.effectiveDir;
	    }
	  }, {
	    key: "tabIndex",
	    get: function get() {
	      return this.interactive ? "0" : "-1";
	    }
	  }, {
	    key: "role",
	    get: function get() {
	      if (this.interactive) {
	        return "button";
	      }

	      return this.accessibleNameText ? "img" : "presentation";
	    }
	  }, {
	    key: "hasIconTooltip",
	    get: function get() {
	      return this.showTooltip && this.accessibleNameText;
	    }
	  }, {
	    key: "accessibleNameText",
	    get: function get() {
	      if (this.accessibleName) {
	        return this.accessibleName;
	      }

	      return this.i18nBundle.getText(this.accData) || undefined;
	    }
	  }], [{
	    key: "onDefine",
	    value: function () {
	      var _onDefine = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee3() {
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                this.createGlobalStyle(); // hide all icons until the first icon has rendered (and added the Icon.css)

	                _context3.next = 3;
	                return __chunk_1.fetchI18nBundle("@ui5/webcomponents");

	              case 3:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function onDefine() {
	        return _onDefine.apply(this, arguments);
	      }

	      return onDefine;
	    }()
	  }, {
	    key: "createGlobalStyle",
	    value: function createGlobalStyle() {
	      if (!window.ShadyDOM) {
	        return;
	      }

	      var styleElement = document.head.querySelector("style[data-ui5-icon-global]");

	      if (!styleElement) {
	        __chunk_1.createStyleInHead("ui5-icon { display: none !important; }", {
	          "data-ui5-icon-global": ""
	        });
	      }
	    }
	  }, {
	    key: "removeGlobalStyle",
	    value: function removeGlobalStyle() {
	      if (!window.ShadyDOM) {
	        return;
	      }

	      var styleElement = document.head.querySelector("style[data-ui5-icon-global]");

	      if (styleElement) {
	        document.head.removeChild(styleElement);
	      }
	    }
	  }, {
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
	      return iconCss;
	    }
	  }]);

	  return Icon;
	}(__chunk_1.UI5Element);

	Icon.define();

	exports.Icon = Icon;

});
//# sourceMappingURL=chunk-1be5f319.js.map
