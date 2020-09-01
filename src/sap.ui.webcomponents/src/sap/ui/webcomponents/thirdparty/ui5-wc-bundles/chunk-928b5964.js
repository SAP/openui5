sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5'], function (exports, __chunk_1, __chunk_2, __chunk_6, __chunk_7) { 'use strict';

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<label class=\"ui5-label-root\" dir=\"", "\" @click=", " for=\"", "\"><span class=\"ui5-label-text-wrapper\"><bdi id=\"", "-bdi\"><slot></slot></bdi></span><span class=\"ui5-label-required-colon\"></span></label>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.ifDefined(context.effectiveDir), context._onclick, __chunk_2.ifDefined(context["for"]), __chunk_2.ifDefined(context._id));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var labelCss = ":host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapContent_LabelColor);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;cursor:text}:host(:not([wrap])) .ui5-label-root{width:100%;font-weight:inherit;display:inline-block;white-space:nowrap;cursor:inherit;overflow:hidden}bdi{content:\"\";padding-right:.15625rem}:host(:not([wrap])) .ui5-label-text-wrapper{text-overflow:ellipsis;overflow:hidden;display:inline-block;vertical-align:top;max-width:100%}:host(:not([wrap])[required][show-colon]) .ui5-label-text-wrapper{max-width:calc(100% - .85rem)}:host(:not([wrap])[required]) .ui5-label-text-wrapper{max-width:calc(100% - .475rem)}:host(:not([wrap])[show-colon]) .ui5-label-text-wrapper{max-width:calc(100% - .2rem)}:host([show-colon]) .ui5-label-required-colon:before{content:\":\"}:host([required]) .ui5-label-required-colon:after{content:\"*\";color:var(--sapField_RequiredColor);font-size:1.25rem;font-weight:700;position:relative;font-style:normal;vertical-align:middle;line-height:0}:host([required][show-colon]) .ui5-label-required-colon:after{margin-right:0;margin-left:.125rem}:host([required][show-colon]) [dir=rtl] .ui5-label-required-colon:after{margin-right:.125rem;margin-left:0}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-label",
	  properties:
	  /** @lends sap.ui.webcomponents.main.Label.prototype */
	  {
	    /**
	     * Defines whether an asterisk character is added to the <code>ui5-label</code> text.
	     * <br><br>
	     * <b>Note:</b> Usually indicates that user input is required.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    required: {
	      type: Boolean
	    },

	    /**
	     * Determines whether the <code>ui5-label</code> should wrap, when there is not enough space.
	     * <br><br>
	     * <b>Note:</b> By default the text would truncate.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    wrap: {
	      type: Boolean
	    },

	    /**
	     * Defines whether semi-colon is added to the <code>ui5-label</code> text.
	     * <br><br>
	     * <b>Note:</b> Usually used in forms.
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    showColon: {
	      type: Boolean
	    },

	    /**
	     * Defines the labeled input by providing its ID.
	     * <br><br>
	     * <b>Note:</b> Can be used with both <code>ui5-input</code> and native input.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    "for": {
	      type: String
	    }
	  },
	  slots:
	  /** @lends sap.ui.webcomponents.main.Label.prototype */
	  {
	    /**
	     * Defines the text of the <code>ui5-label</code>.
	     * <br><b>Note:</b> Аlthough this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
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
	 * The <code>ui5-label</code> is a component used to represent a label,
	 * providing valuable information to the user.
	 * Usually it is placed next to a value holder, such as a text field.
	 * It informs the user about what data is displayed or expected in the value holder.
	 * <br><br>
	 * The <code>ui5-label</code> appearance can be influenced by properties,
	 * such as <code>required</code> and <code>wrap</code>.
	 * The appearance of the Label can be configured in a limited way by using the design property.
	 * For a broader choice of designs, you can use custom styles.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/Label";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Label
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-label
	 * @public
	 */

	var Label =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Label, _UI5Element);

	  function Label() {
	    __chunk_1._classCallCheck(this, Label);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Label).apply(this, arguments));
	  }

	  __chunk_1._createClass(Label, [{
	    key: "_onclick",
	    value: function _onclick() {
	      var elementToFocus = document.getElementById(this["for"]);

	      if (elementToFocus) {
	        elementToFocus.focus();
	      }
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
	      return labelCss;
	    }
	  }]);

	  return Label;
	}(__chunk_1.UI5Element);

	Label.define();

	exports.Label = Label;

});
//# sourceMappingURL=chunk-928b5964.js.map
