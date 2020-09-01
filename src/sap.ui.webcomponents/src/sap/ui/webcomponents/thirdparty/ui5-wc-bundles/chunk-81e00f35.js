sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-04be579f', './chunk-35c756ba'], function (exports, __chunk_1, __chunk_2, __chunk_6, __chunk_7, __chunk_10, __chunk_24) { 'use strict';

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<footer class=\"ui5-popup-footer-root\"><slot name=\"footer\"></slot></footer>"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<h2 class=\"ui5-popup-header-text\">", "</h2>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<slot name=\"header\"></slot>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<section style=\"", "\" class=\"", "\" role=\"dialog\" aria-modal=\"", "\" aria-label=\"", "\" aria-labelledby=\"", "\"><span class=\"first-fe\" data-ui5-focus-trap tabindex=\"0\" @focusin=", "></span><header class=\"ui5-popup-header-root\" id=\"ui5-popup-header\">", "</header><div style=\"", "\" class=\"", "\"  @scroll=\"", "\"><slot></slot></div>", "<span class=\"last-fe\" data-ui5-focus-trap tabindex=\"0\" @focusin=", "></span></section> "]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.styleMap(context.styles.root), __chunk_2.classMap(context.classes.root), __chunk_2.ifDefined(context._ariaModal), __chunk_2.ifDefined(context._ariaLabel), __chunk_2.ifDefined(context._ariaLabelledBy), context.forwardToLast, context.header.length ? block1(context) : block2(context), __chunk_2.styleMap(context.styles.content), __chunk_2.classMap(context.classes.content), context._scroll, context.footer.length ? block3(context) : undefined, context.forwardToFirst);
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2());
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(context.headerText));
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4());
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var dialogCSS = ":host{top:50%;left:50%;transform:translate(-50%,-50%);min-width:20rem;box-shadow:var(--sapContent_Shadow3)}:host([stretch]){width:90%;height:90%}:host([stretch][on-phone]){width:100%;height:100%}:host([stretch][on-phone]) .ui5-popup-root{max-height:100vh;max-width:100vw}.ui5-popup-root{display:flex;flex-direction:column;max-width:100vw}.ui5-popup-content{flex:1 1 auto}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-dialog",
	  slots:
	  /** @lends  sap.ui.webcomponents.main.Popup.prototype */
	  {
	    /**
	     * Defines the header HTML Element.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    header: {
	      type: HTMLElement
	    },

	    /**
	     * Defines the footer HTML Element.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    footer: {
	      type: HTMLElement
	    }
	  },
	  properties:
	  /** @lends  sap.ui.webcomponents.main.Dialog.prototype */
	  {
	    /**
	     * Defines the header text.
	     * <br><br>
	     * <b>Note:</b> If <code>header</code> slot is provided, the <code>headerText</code> is ignored.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    headerText: {
	      type: String
	    },

	    /**
	     * Determines whether the <code>ui5-dialog</code> should be stretched to fullscreen.
	     * <br><br>
	     * <b>Note:</b> The <code>ui5-dialog</code> will be stretched to aproximetly
	     * 90% of the viewport.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    stretch: {
	      type: Boolean
	    },

	    /**
	     * @private
	     */
	    onPhone: {
	      type: Boolean
	    }
	  }
	};
	/**
	 * @class
	 * <h3 class="comment-api-title">Overview</h3>
	 * The <code>ui5-dialog</code> component is used to temporarily display some information in a
	 * size-limited window in front of the regular app screen.
	 * It is used to prompt the user for an action or a confirmation.
	 * The <code>ui5-dialog</code> interrupts the current app processing as it is the only focused UI element and
	 * the main screen is dimmed/blocked.
	 * The dialog combines concepts known from other technologies where the windows have
	 * names such as dialog box, dialog window, pop-up, pop-up window, alert box, or message box.
	 * <br><br>
	 * The <code>ui5-dialog</code> is modal, which means that user action is required before returning to the parent window is possible.
	 * The content of the <code>ui5-dialog</code> is fully customizable.
	 *
	 * <h3>Structure</h3>
	 * A <code>ui5-dialog</code> consists of a header, content, and a footer for action buttons.
	 * The <code>ui5-dialog</code> is usually displayed at the center of the screen.
	 *
	 * <h3>Responsive Behavior</h3>
	 * The <code>stretch</code> property can be used to stretch the
	 * <code>ui5-dialog</code> on full screen.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/Dialog";</code>
	 *
	 * <b>Note:</b> We don't recommend nesting popup-like components (<code>ui5-dialog</code>, <code>ui5-popover</code>) inside <code>ui5-dialog</code>.
	 * Ideally you should create all popups on the same level inside your HTML page and just open them from one another, rather than nesting them.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Dialog
	 * @extends Popup
	 * @tagname ui5-dialog
	 * @public
	 */

	var Dialog =
	/*#__PURE__*/
	function (_Popup) {
	  __chunk_1._inherits(Dialog, _Popup);

	  function Dialog() {
	    __chunk_1._classCallCheck(this, Dialog);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Dialog).apply(this, arguments));
	  }

	  __chunk_1._createClass(Dialog, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      this.onPhone = __chunk_10.isPhone();
	    }
	  }, {
	    key: "isModal",
	    get: function get() {
	      // Required by Popup.js
	      return true;
	    }
	  }, {
	    key: "_ariaLabelledBy",
	    get: function get() {
	      // Required by Popup.js
	      return this.ariaLabel ? undefined : "ui5-popup-header";
	    }
	  }, {
	    key: "_ariaModal",
	    get: function get() {
	      // Required by Popup.js
	      return true;
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      return {
	        root: {
	          "ui5-popup-root": true
	        },
	        content: {
	          "ui5-popup-content": true
	        }
	      };
	    }
	  }], [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return [__chunk_24.PopupsCommonCss, dialogCSS];
	    }
	  }]);

	  return Dialog;
	}(__chunk_24.Popup);

	Dialog.define();

	exports.Dialog = Dialog;

});
//# sourceMappingURL=chunk-81e00f35.js.map
