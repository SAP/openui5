sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-8b7daeae'], function (exports, __chunk_1, __chunk_2, __chunk_6, __chunk_7, __chunk_28) { 'use strict';

	function _templateObject7() {
	  var data = __chunk_1._taggedTemplateLiteral(["<h6 class=\"ui5-title-root\"><span id=\"", "-inner\"><slot></slot></span></h6>"]);

	  _templateObject7 = function _templateObject7() {
	    return data;
	  };

	  return data;
	}

	function _templateObject6() {
	  var data = __chunk_1._taggedTemplateLiteral(["<h5 class=\"ui5-title-root\"><span id=\"", "-inner\"><slot></slot></span></h5>"]);

	  _templateObject6 = function _templateObject6() {
	    return data;
	  };

	  return data;
	}

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["<h4 class=\"ui5-title-root\"><span id=\"", "-inner\"><slot></slot></span></h4>"]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<h3 class=\"ui5-title-root\"><span id=\"", "-inner\"><slot></slot></span></h3>"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<h2 class=\"ui5-title-root\"><span id=\"", "-inner\"><slot></slot></span></h2>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<h1 class=\"ui5-title-root\"><span id=\"", "-inner\"><slot></slot></span></h1>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["", "", "", "", "", "", ""]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), context.h1 ? block1(context) : undefined, context.h2 ? block2(context) : undefined, context.h3 ? block3(context) : undefined, context.h4 ? block4(context) : undefined, context.h5 ? block5(context) : undefined, context.h6 ? block6(context) : undefined);
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), __chunk_2.ifDefined(context._id));
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(context._id));
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4(), __chunk_2.ifDefined(context._id));
	};

	var block4 = function block4(context) {
	  return __chunk_2.scopedHtml(_templateObject5(), __chunk_2.ifDefined(context._id));
	};

	var block5 = function block5(context) {
	  return __chunk_2.scopedHtml(_templateObject6(), __chunk_2.ifDefined(context._id));
	};

	var block6 = function block6(context) {
	  return __chunk_2.scopedHtml(_templateObject7(), __chunk_2.ifDefined(context._id));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var titleCss = ":host(:not([hidden])){display:block;cursor:text}:host{max-width:100%;color:var(--sapGroup_TitleTextColor);font-size:var(--ui5_title_level_2Size);font-family:var(--sapFontFamily);text-shadow:var(--sapContent_TextShadow)}.ui5-title-root{display:inline-block;position:relative;font-weight:400;font-size:inherit;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;vertical-align:bottom;-webkit-margin-before:0;-webkit-margin-after:0;-webkit-margin-start:0;-webkit-margin-end:0;margin:0;cursor:inherit}:host([wrap]) .ui5-title-root{white-space:pre-line}:host([level=H1]){font-size:var(--ui5_title_level_1Size)}:host([level=H2]){font-size:var(--ui5_title_level_2Size)}:host([level=H3]){font-size:var(--ui5_title_level_3Size)}:host([level=H4]){font-size:var(--ui5_title_level_4Size)}:host([level=H5]){font-size:var(--ui5_title_level_5Size)}:host([level=H6]){font-size:var(--ui5_title_level_6Size)}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-title",
	  properties:
	  /** @lends sap.ui.webcomponents.main.Title.prototype */
	  {
	    /**
	     * Defines whether the <code>ui5-title</code> would wrap.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	    */
	    wrap: {
	      type: Boolean
	    },

	    /**
	     * Defines the <code>ui5-title</code> level.
	     * Available options are: <code>"H6"</code> to <code>"H1"</code>.
	     *
	     * @type {TitleLevel}
	     * @defaultvalue "H2"
	     * @public
	    */
	    level: {
	      type: __chunk_28.TitleLevel,
	      defaultValue: __chunk_28.TitleLevel.H2
	    }
	  },
	  slots:
	  /** @lends sap.ui.webcomponents.main.Title.prototype */
	  {
	    /**
	     * Defines the text of the <code>ui5-title</code>.
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
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-title</code> component is used to display titles inside a page.
	 * It is a simple, large-sized text with explicit header/title semantics.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/Title";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Title
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-title
	 * @public
	 */

	var Title =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Title, _UI5Element);

	  function Title() {
	    __chunk_1._classCallCheck(this, Title);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Title).apply(this, arguments));
	  }

	  __chunk_1._createClass(Title, [{
	    key: "normalizedLevel",
	    get: function get() {
	      return this.level.toLowerCase();
	    }
	  }, {
	    key: "h1",
	    get: function get() {
	      return this.normalizedLevel === "h1";
	    }
	  }, {
	    key: "h2",
	    get: function get() {
	      return this.normalizedLevel === "h2";
	    }
	  }, {
	    key: "h3",
	    get: function get() {
	      return this.normalizedLevel === "h3";
	    }
	  }, {
	    key: "h4",
	    get: function get() {
	      return this.normalizedLevel === "h4";
	    }
	  }, {
	    key: "h5",
	    get: function get() {
	      return this.normalizedLevel === "h5";
	    }
	  }, {
	    key: "h6",
	    get: function get() {
	      return this.normalizedLevel === "h6";
	    }
	  }], [{
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
	      return titleCss;
	    }
	  }]);

	  return Title;
	}(__chunk_1.UI5Element);

	Title.define();

	exports.Title = Title;

});
//# sourceMappingURL=chunk-c52baa5e.js.map
