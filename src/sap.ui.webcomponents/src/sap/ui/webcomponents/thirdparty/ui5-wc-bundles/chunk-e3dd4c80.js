sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-1be5f319'], function (exports, __chunk_1, __chunk_2, __chunk_3, __chunk_5, __chunk_6, __chunk_7, __chunk_9) { 'use strict';

	function _templateObject6() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-avatar-initials\">", "</span>"]);

	  _templateObject6 = function _templateObject6() {
	    return data;
	  };

	  return data;
	}

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-icon class=\"ui5-avatar-icon\" name=\"", "\" accessible-name=\"", "\"></ui5-icon>"]);

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
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-avatar-img\" style=\"", "\" role=\"img\" aria-label=\"", "\"></span>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-avatar-root\">", "</div>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), context.image ? block1(context) : block2(context));
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), __chunk_2.styleMap(context.styles.img), __chunk_2.ifDefined(context.accessibleNameText));
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), context.icon ? block3(context) : block4(context));
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4(), __chunk_2.ifDefined(context.icon), __chunk_2.ifDefined(context.accessibleNameText));
	};

	var block4 = function block4(context) {
	  return __chunk_2.scopedHtml(_templateObject5(), context.initials ? block5(context) : undefined);
	};

	var block5 = function block5(context) {
	  return __chunk_2.scopedHtml(_templateObject6(), __chunk_2.ifDefined(context.validInitials));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var AvatarCss = ":host(:not([hidden])){display:inline-block;box-sizing:border-box}:host(:not([hidden]).ui5_hovered){opacity:.7}:host{height:3rem;width:3rem;border-radius:50%;border:var(--ui5-avatar-initials-border);outline:none;color:var(--ui5-avatar-initials-color)}:host([shape=Square]){border-radius:.25rem}:host([shape=Square]) .ui5-avatar-root{border-radius:inherit}:host([shape=Square]) .ui5-avatar-img{border-radius:inherit}:host([size=XS]){height:2rem;width:2rem;font-size:.75rem}:host([size=S]){height:3rem;width:3rem;font-size:1.125rem}:host([size=M]){height:4rem;width:4rem;font-size:1.625rem}:host([size=L]){height:5rem;width:5rem;font-size:2rem}:host([size=XL]){height:7rem;width:7rem;font-size:2.75rem}:host .ui5-avatar-icon{height:1.5rem;width:1.5rem}:host([size=XS]) .ui5-avatar-icon{height:1rem;width:1rem}:host([size=S]) .ui5-avatar-icon{height:1.5rem;width:1.5rem}:host([size=M]) .ui5-avatar-icon{height:2rem;width:2rem}:host([size=L]) .ui5-avatar-icon{height:2.5rem;width:2.5rem}:host([size=XL]) .ui5-avatar-icon{height:3rem;width:3rem}:host(:not([image])){background-color:var(--ui5-avatar-accent6)}:host([background-color=Accent1]){background-color:var(--ui5-avatar-accent1)}:host([background-color=Accent2]){background-color:var(--ui5-avatar-accent2)}:host([background-color=Accent3]){background-color:var(--ui5-avatar-accent3)}:host([background-color=Accent4]){background-color:var(--ui5-avatar-accent4)}:host([background-color=Accent5]){background-color:var(--ui5-avatar-accent5)}:host([background-color=Accent6]){background-color:var(--ui5-avatar-accent6)}:host([background-color=Accent7]){background-color:var(--ui5-avatar-accent7)}:host([background-color=Accent8]){background-color:var(--ui5-avatar-accent8)}:host([background-color=Accent9]){background-color:var(--ui5-avatar-accent9)}:host([background-color=Accent10]){background-color:var(--ui5-avatar-accent10)}:host([background-color=Placeholder]){background-color:var(--ui5-avatar-placeholder)}:host(:not([image])) .ui5-avatar-icon{color:inherit}:host([image-fit-type=Contain]) .ui5-avatar-img{background-size:contain}.ui5-avatar-root{display:flex;align-items:center;justify-content:center}.ui5-avatar-img,.ui5-avatar-root{height:100%;width:100%;border-radius:50%}.ui5-avatar-img{background-repeat:no-repeat;background-position:50%;background-size:cover}.ui5-avatar-initials{color:inherit}";

	/**
	 * Different types of AvatarSize.
	 * @lends sap.ui.webcomponents.main.types.AvatarSize.prototype
	 * @public
	 */

	var AvatarSizes = {
	  /**
	   * component size - 2rem
	   * font size - 1rem
	   * @public
	   * @type {XS}
	   */
	  XS: "XS",

	  /**
	   * component size - 3rem
	   * font size - 1.5rem
	   * @public
	   * @type {S}
	   */
	  S: "S",

	  /**
	   * component size - 4rem
	   * font size - 2rem
	   * @public
	   * @type {M}
	   */
	  M: "M",

	  /**
	   * component size - 5rem
	   * font size - 2.5rem
	   * @public
	   * @type {L}
	   */
	  L: "L",

	  /**
	   * component size - 7rem
	   * font size - 3rem
	   * @public
	   * @type {XL}
	   */
	  XL: "XL"
	};
	/**
	 * @class
	 * Different types of AvatarSize.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.AvatarSize
	 * @public
	 * @enum {string}
	 */

	var AvatarSize =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(AvatarSize, _DataType);

	  function AvatarSize() {
	    __chunk_1._classCallCheck(this, AvatarSize);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(AvatarSize).apply(this, arguments));
	  }

	  __chunk_1._createClass(AvatarSize, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!AvatarSizes[value];
	    }
	  }]);

	  return AvatarSize;
	}(__chunk_1.DataType);

	AvatarSize.generataTypeAcessors(AvatarSizes);

	/**
	 * Different types of AvatarShape.
	 * @lends sap.ui.webcomponents.main.types.AvatarShape.prototype
	 * @public
	 */

	var AvatarShapes = {
	  /**
	   * Circular shape.
	   * @public
	   * @type {Circle}
	   */
	  Circle: "Circle",

	  /**
	   * Square shape.
	   * @public
	   * @type {Square}
	   */
	  Square: "Square"
	};
	/**
	 * @class
	 * Different types of AvatarShape.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.AvatarShape
	 * @public
	 * @enum {string}
	 */

	var AvatarShape =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(AvatarShape, _DataType);

	  function AvatarShape() {
	    __chunk_1._classCallCheck(this, AvatarShape);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(AvatarShape).apply(this, arguments));
	  }

	  __chunk_1._createClass(AvatarShape, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!AvatarShapes[value];
	    }
	  }]);

	  return AvatarShape;
	}(__chunk_1.DataType);

	AvatarShape.generataTypeAcessors(AvatarShapes);

	/**
	 * Different types of AvatarFitType.
	 * @lends sap.ui.webcomponents.main.types.AvatarFitType.prototype
	 * @public
	 */

	var AvatarFitTypes = {
	  /**
	   *
	   * @type {Cover}
	   * @public
	   */
	  Cover: "Cover",

	  /**
	   * @type {Contain}
	   * @public
	   */
	  Contain: "Contain"
	};
	/**
	 * @class
	 * Different types of AvatarFitType.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.AvatarFitType
	 * @public
	 * @enum {string}
	 */

	var AvatarFitType =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(AvatarFitType, _DataType);

	  function AvatarFitType() {
	    __chunk_1._classCallCheck(this, AvatarFitType);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(AvatarFitType).apply(this, arguments));
	  }

	  __chunk_1._createClass(AvatarFitType, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!AvatarFitTypes[value];
	    }
	  }]);

	  return AvatarFitType;
	}(__chunk_1.DataType);

	AvatarFitType.generataTypeAcessors(AvatarFitTypes);

	/**
	 * Different types of AvatarBackgroundColor.
	 * @lends sap.ui.webcomponents.main.types.AvatarBackgroundColor.prototype
	 * @public
	 */

	var AvatarBackGroundColors = {
	  /**
	   *
	   * @public
	   * @type {Accent1}
	   */
	  Accent1: "Accent1",

	  /**
	   *
	   * @public
	   * @type {Accent2}
	   */
	  Accent2: "Accent2",

	  /**
	   *
	   * @public
	   * @type {Accent3}
	   */
	  Accent3: "Accent3",

	  /**
	   *
	   * @public
	   * @type {Accent4}
	   */
	  Accent4: "Accent4",

	  /**
	   *
	   * @public
	   * @type {Accent5}
	   */
	  Accent5: "Accent5",

	  /**
	   *
	   * @public
	   * @type {Accent6}
	   */
	  Accent6: "Accent6",

	  /**
	   *
	   * @public
	   * @type {Accent7}
	   */
	  Accent7: "Accent7",

	  /**
	   *
	   * @public
	   * @type {Accent8}
	   */
	  Accent8: "Accent8",

	  /**
	   *
	   * @public
	   * @type {Accent9}
	   */
	  Accent9: "Accent9",

	  /**
	   *
	   * @public
	   * @type {Accent10}
	   */
	  Accent10: "Accent10",

	  /**
	   *
	   * @public
	   * @type {Placeholder}
	   */
	  Placeholder: "Placeholder"
	};
	/**
	 * @class
	 * Different types of AvatarBackgroundColor.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.AvatarBackgroundColor
	 * @public
	 * @enum {string}
	 */

	var AvatarBackgroundColor =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(AvatarBackgroundColor, _DataType);

	  function AvatarBackgroundColor() {
	    __chunk_1._classCallCheck(this, AvatarBackgroundColor);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(AvatarBackgroundColor).apply(this, arguments));
	  }

	  __chunk_1._createClass(AvatarBackgroundColor, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!AvatarBackGroundColors[value];
	    }
	  }]);

	  return AvatarBackgroundColor;
	}(__chunk_1.DataType);

	AvatarBackgroundColor.generataTypeAcessors(AvatarBackGroundColors);

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-avatar",
	  languageAware: true,
	  properties:
	  /** @lends sap.ui.webcomponents.main.Avatar.prototype */
	  {
	    /**
	     * Defines the source path to the desired image.
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    image: {
	      type: String
	    },

	    /**
	     * Defines the name of the UI5 Icon, that would be displayed.
	     * <br>
	     * <b>Note:</b> If <code>image</code> is set, the property would be ignored.
	     * <br>
	     * <b>Note:</b> You should import the desired icon first, then use its name as "icon".
	     * <br><br>
	     * import "@ui5/webcomponents-icons/dist/icons/{icon_name}.js"
	     * <br>
	     * <pre>&lt;ui5-avatar icon-src="employee"></pre>
	     *
	     * See all the available icons in the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    icon: {
	      type: String
	    },

	    /**
	     * Defines the displayed initials.
	     * <br>
	     * Up to two Latin letters can be displayed as initials in a <code>ui5-avatar</code>.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    initials: {
	      type: String
	    },

	    /**
	     * Defines the shape of the <code>ui5-avatar</code>.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>Circle</code></li>
	     * <li><code>Square</code></li>
	     * <ul>
	     * @type {AvatarShape}
	     * @defaultvalue "Circle"
	     * @public
	     */
	    shape: {
	      type: String,
	      defaultValue: AvatarShape.Circle
	    },

	    /**
	     * Defines predefined size of the <code>ui5-avatar</code>.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>XS</code></li>
	     * <li><code>S</code></li>
	     * <li><code>M</code></li>
	     * <li><code>L</code></li>
	     * <li><code>XL</code></li>
	     * <ul>
	     * @type {AvatarSize}
	     * @defaultvalue "S"
	     * @public
	     */
	    size: {
	      type: String,
	      defaultValue: AvatarSize.S
	    },

	    /**
	     * Defines the fit type of the desired image.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>Cover</code></li>
	     * <li><code>Contain</code></li>
	     * <ul>
	     * @type {AvatarFitType}
	     * @defaultvalue "Cover"
	     * @public
	     */
	    imageFitType: {
	      type: String,
	      defaultValue: AvatarFitType.Cover
	    },

	    /**
	     * Defines the background color of the desired image.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>Accent1</code></li>
	     * <li><code>Accent2</code></li>
	     * <li><code>Accent3</code></li>
	     * <li><code>Accent4</code></li>
	     * <li><code>Accent5</code></li>
	     * <li><code>Accent6</code></li>
	     * <li><code>Accent7</code></li>
	     * <li><code>Accent8</code></li>
	     * <li><code>Accent9</code></li>
	     * <li><code>Accent10</code></li>
	     * <li><code>Placeholder</code></li>
	     * <ul>
	     * @type {AvatarBackgroundColor}
	     * @defaultvalue "Accent6"
	     * @public
	     */
	    backgroundColor: {
	      type: String,
	      defaultValue: AvatarBackgroundColor.Accent6
	    },

	    /**
	     * Defines the text alternative of the <code>ui5-avatar</code>.
	     * If not provided a default text alternative will be set, if present.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     * @since 1.0.0-rc.7
	     */
	    accessibleName: {
	      type: String
	    }
	  },
	  slots:
	  /** @lends sap.ui.webcomponents.main.Avatar.prototype */
	  {},
	  events:
	  /** @lends sap.ui.webcomponents.main.Avatar.prototype */
	  {}
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * An image-like control that has different display options for representing images and icons
	 * in different shapes and sizes, depending on the use case.
	 *
	 * The shape can be circular or square. There are several predefined sizes, as well as an option to
	 * set a custom size.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import @ui5/webcomponents/dist/Avatar.js";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Avatar
	 * @extends UI5Element
	 * @tagname ui5-avatar
	 * @since 1.0.0-rc.6
	 * @public
	 */

	var Avatar =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Avatar, _UI5Element);

	  function Avatar() {
	    var _this;

	    __chunk_1._classCallCheck(this, Avatar);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Avatar).call(this));
	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    return _this;
	  }

	  __chunk_1._createClass(Avatar, [{
	    key: "validInitials",
	    get: function get() {
	      var validInitials = /^[a-zA-Z]{1,2}$/;

	      if (this.initials && validInitials.test(this.initials)) {
	        return this.initials;
	      }

	      return null;
	    }
	  }, {
	    key: "accessibleNameText",
	    get: function get() {
	      if (this.accessibleName) {
	        return this.accessibleName;
	      }

	      return this.i18nBundle.getText(__chunk_5.AVATAR_TOOLTIP) || undefined;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      var image = this.image.replace(/%/g, "%25").replace(/#/g, "%23");
	      return {
	        img: {
	          "background-image": "url(\"".concat(image, "\")")
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
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return AvatarCss;
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

	  return Avatar;
	}(__chunk_1.UI5Element);

	Avatar.define();

	exports.Avatar = Avatar;

});
//# sourceMappingURL=chunk-e3dd4c80.js.map
