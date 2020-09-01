sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-04be579f', './chunk-928b5964'], function (exports, __chunk_1, __chunk_2, __chunk_3, __chunk_5, __chunk_6, __chunk_7, __chunk_10, __chunk_12) { 'use strict';

	/**
	 * @lends sap.ui.webcomponents.main.types.BusyIndicatorSize.prototype
	 * @public
	 */

	var BusyIndicatorSizes = {
	  /**
	   * small size
	   * @public
	   * @type {Small}
	   */
	  Small: "Small",

	  /**
	   * medium size
	   * @public
	   * @type {Medium}
	   */
	  Medium: "Medium",

	  /**
	   * large size
	   * @public
	   * @type {Large}
	   */
	  Large: "Large"
	};
	/**
	 * @class
	 * Different types of BusyIndicator.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.BusyIndicatorSize
	 * @public
	 * @enum {string}
	 */

	var BusyIndicatorSize =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(BusyIndicatorSize, _DataType);

	  function BusyIndicatorSize() {
	    __chunk_1._classCallCheck(this, BusyIndicatorSize);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(BusyIndicatorSize).apply(this, arguments));
	  }

	  __chunk_1._createClass(BusyIndicatorSize, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!BusyIndicatorSizes[value];
	    }
	  }]);

	  return BusyIndicatorSize;
	}(__chunk_1.DataType);

	BusyIndicatorSize.generataTypeAcessors(BusyIndicatorSizes);

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-label class=\"ui5-busyindicator-text\">", "</ui5-label>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-busyindicator-dynamic-content\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\" title=\"", "\"><div class=\"ui5-busyindicator-circle circle-animation-0\"></div><div class=\"ui5-busyindicator-circle circle-animation-1\"></div><div class=\"ui5-busyindicator-circle circle-animation-2\"></div></div>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"", "\"><div class=\"ui5-busyindicator-wrapper\">", "", "</div><slot></slot></div>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.classMap(context.classes.root), context.active ? block1(context) : undefined, context.text ? block2(context) : undefined);
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), __chunk_2.ifDefined(context.ariaTitle));
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(context.text));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var busyIndicatorCss = ":host(:not([hidden])){display:inline-block}:host(:not([active])) .ui5-busyindicator-wrapper{display:none}:host([active]){color:var(--sapContent_IconColor);pointer-events:none}:host([active]) :not(.ui5-busyindicator-root--ie) ::slotted(:not([class^=ui5-busyindicator-])){opacity:.6}:host([active]) .ui5-busyindicator-root--ie ::slotted(:not([class^=ui5-busyindicator-])){opacity:.95}:host([size=Small]) .ui5-busyindicator-root{min-width:1.5em;min-height:.5rem}:host([size=Small][text]:not([text=\"\"])) .ui5-busyindicator-root{min-height:1.75rem}:host([size=Small]) .ui5-busyindicator-circle{width:.5rem;height:.5rem}:host(:not([size])) .ui5-busyindicator-root,:host([size=Medium]) .ui5-busyindicator-root{min-width:3rem;min-height:1rem}:host(:not([size])[text]:not([text=\"\"])) .ui5-busyindicator-root,:host([size=Medium][text]:not([text=\"\"])) .ui5-busyindicator-root{min-height:2.25rem}:host(:not([size])) .ui5-busyindicator-circle,:host([size=Medium]) .ui5-busyindicator-circle{width:1rem;height:1rem}:host([size=Large]) .ui5-busyindicator-root{min-width:6rem;min-height:2rem}:host([size=Large][text]:not([text=\"\"])) .ui5-busyindicator-root{min-height:3.25rem}:host([size=Large]) .ui5-busyindicator-circle{width:2rem;height:2rem}.ui5-busyindicator-root{display:flex;justify-content:center;align-items:center;position:relative;background-color:inherit}.ui5-busyindicator-wrapper{position:absolute;z-index:99;width:100%;left:0;right:0;top:50%;transform:translateY(-50%)}.ui5-busyindicator-circle{display:inline-block;background-color:currentColor;border-radius:50%}.ui5-busyindicator-circle:before{content:\"\";width:100%;height:100%;border-radius:100%}.ui5-busyindicator-dynamic-content{height:100%;display:flex;justify-content:center;align-items:center;background-color:inherit}.circle-animation-0{animation:grow 1.6s cubic-bezier(.32,.06,.85,1.11) infinite}.circle-animation-1{animation:grow 1.6s cubic-bezier(.32,.06,.85,1.11) infinite;animation-delay:.2s}.circle-animation-2{animation:grow 1.6s cubic-bezier(.32,.06,.85,1.11) infinite;animation-delay:.4s}.ui5-busyindicator-text{width:100%;margin-top:.25rem;text-align:center}@keyframes grow{0%,50%,to{-webkit-transform:scale(.5);-moz-transform:scale(.5);-ms-transform:scale(.5);transform:scale(.5)}25%{-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-busyindicator",
	  languageAware: true,
	  slots:
	  /** @lends sap.ui.webcomponents.main.BusyIndicator.prototype */
	  {
	    /**
	     * Determines the content over which the <code>ui5-busyindicator</code> will appear.
	     *
	     * @type {Node[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      type: Node
	    }
	  },
	  properties:
	  /** @lends sap.ui.webcomponents.main.BusyIndicator.prototype */
	  {
	    /**
	     * Defines text to be displayed below the busy indicator. It can be used to inform the user of the current operation.
	     * @type {String}
	     * @public
	     * @defaultvalue ""
	     * @since 1.0.0-rc.7
	     */
	    text: {
	      type: String
	    },

	    /**
	     * Defines the size of the <code>ui5-busyindicator</code>.
	     * <br><br>
	     * <b>Note:</b> Available options are "Small", "Medium", and "Large".
	     *
	     * @type {BusyIndicatorSize}
	     * @defaultvalue "Medium"
	     * @public
	     */
	    size: {
	      type: BusyIndicatorSize,
	      defaultValue: BusyIndicatorSize.Medium
	    },

	    /**
	     * Defines if the busy indicator is visible on the screen. By default it is not.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    active: {
	      type: Boolean
	    }
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-busyindicator</code> signals that some operation is going on and that the
	 *  user must wait. It does not block the current UI screen so other operations could be
	 *  triggered in parallel.
	 *
	 * <h3>Usage</h3>
	 * For the <code>ui5-busyindicator</code> you can define the size of the indicator, as well
	 * as whether it is shown or hidden. In order to hide it, use the html attribute <code>hidden</code> or <code>display: none;</code>
	 * <br><br>
	 * In order to show busy state for an HTML element, simply nest the HTML element in a <code>ui5-busyindicator</code> instance.
	 * <br>
	 * <b>Note:</b> Since <code>ui5-busyindicator</code> has <code>display: inline-block;</code> by default and no width of its own,
	 * whenever you need to wrap a block-level element, you should set <code>display: block</code> to the busy indicator as well.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/BusyIndicator";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.BusyIndicator
	 * @extends UI5Element
	 * @tagname ui5-busyindicator
	 * @public
	 * @since 0.12.0
	 */

	var BusyIndicator =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(BusyIndicator, _UI5Element);

	  function BusyIndicator() {
	    var _this;

	    __chunk_1._classCallCheck(this, BusyIndicator);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(BusyIndicator).call(this));
	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    _this._preventHandler = _this._preventEvent.bind(__chunk_1._assertThisInitialized(_this));
	    return _this;
	  }

	  __chunk_1._createClass(BusyIndicator, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      if (this.active) {
	        this.tabIndex = -1;
	      } else {
	        this.removeAttribute("tabindex");
	      }
	    }
	  }, {
	    key: "onEnterDOM",
	    value: function onEnterDOM() {
	      this.addEventListener("keyup", this._preventHandler, {
	        capture: true
	      });
	      this.addEventListener("keydown", this._preventHandler, {
	        capture: true
	      });
	    }
	  }, {
	    key: "onExitDOM",
	    value: function onExitDOM() {
	      this.removeEventListener("keyup", this._preventHandler, true);
	      this.removeEventListener("keydown", this._preventHandler, true);
	    }
	  }, {
	    key: "_preventEvent",
	    value: function _preventEvent(event) {
	      if (this.active) {
	        event.stopImmediatePropagation();
	      }
	    }
	  }, {
	    key: "ariaTitle",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.BUSY_INDICATOR_TITLE);
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      return {
	        root: {
	          "ui5-busyindicator-root": true,
	          "ui5-busyindicator-root--ie": __chunk_10.isIE()
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
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return busyIndicatorCss;
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
	      return [__chunk_12.Label];
	    }
	  }]);

	  return BusyIndicator;
	}(__chunk_1.UI5Element);

	BusyIndicator.define();

	exports.BusyIndicator = BusyIndicator;

});
//# sourceMappingURL=chunk-6d950724.js.map
