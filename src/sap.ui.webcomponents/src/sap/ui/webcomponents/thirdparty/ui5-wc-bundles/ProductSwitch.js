sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-57e79e7c', './chunk-2ca5b205', './chunk-b4193b36', './chunk-8f81354a'], function (__chunk_1, __chunk_2, __chunk_6, __chunk_8, __chunk_31, __chunk_32, __chunk_42) { 'use strict';

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-product-switch-root\" @focusin=", "><slot></slot></div>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), context._onfocusin);
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents-fiori", "sap_fiori_3", __chunk_42.defaultTheme);
	var ProductSwitchCss = ":host{font-family:var(--sapFontFamily);font-size:var(--sapFontSize)}.ui5-product-switch-root{display:flex;flex-wrap:wrap;width:752px;padding:1.25rem .75rem}:host([desktop-columns=\"3\"]) .ui5-product-switch-root{width:564px}@media only screen and (max-width:900px){.ui5-product-switch-root{width:564px}}@media only screen and (max-width:600px){.ui5-product-switch-root,:host([desktop-columns=\"3\"]) .ui5-product-switch-root{flex-direction:column;padding:0;width:100%}}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-product-switch",
	  properties:
	  /** @lends sap.ui.webcomponents.fiori.ProductSwitch.prototype */
	  {
	    /**
	     * Indicates how many columns are displayed.
	     * @private
	     */
	    desktopColumns: {
	      type: __chunk_1.Integer
	    }
	  },
	  managedSlots: true,
	  slots:
	  /** @lends sap.ui.webcomponents.fiori.ProductSwitch.prototype */
	  {
	    /**
	     * Defines the items of the <code>ui5-product-switch</code>.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      propertyName: "items",
	      type: HTMLElement
	    }
	  }
	};
	/**
	 * @class
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-product-switch</code> is an SAP Fiori specific web component that is used in <code>ui5-shellbar</code>
	 * and allows the user to easily switch between products.
	 * <br><br>
	 * <h3>ES6 Module Import</h3>
	 * <code>import "@ui5/webcomponents-fiori/dist/ProductSwitch.js";</code>
	 * <br>
	 * <code>import "@ui5/webcomponents-fiori/dist/ProductSwitchItem.js";</code> (for <code>ui5-product-switch-item</code>)
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.fiori.ProductSwitch
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-product-switch
	 * @appenddocs ProductSwitchItem
	 * @public
	 * @since 1.0.0-rc.5
	 */

	var ProductSwitch =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(ProductSwitch, _UI5Element);

	  function ProductSwitch() {
	    var _this;

	    __chunk_1._classCallCheck(this, ProductSwitch);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ProductSwitch).call(this));

	    _this.initItemNavigation();

	    return _this;
	  }

	  __chunk_1._createClass(ProductSwitch, [{
	    key: "initItemNavigation",
	    value: function initItemNavigation() {
	      var _this2 = this;

	      this._itemNavigation = new __chunk_31.ItemNavigation(this, {
	        rowSize: 4
	      });

	      this._itemNavigation.getItemsCallback = function () {
	        return _this2.items;
	      };
	    }
	  }, {
	    key: "onEnterDOM",
	    value: function onEnterDOM() {
	      this._handleResizeBound = this._handleResize.bind(this);
	      __chunk_32.ResizeHandler.register(document.body, this._handleResizeBound);
	    }
	  }, {
	    key: "onExitDOM",
	    value: function onExitDOM() {
	      __chunk_32.ResizeHandler.deregister(document.body, this._handleResizeBound);
	    }
	  }, {
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      this.desktopColumns = this.items.length > 6 ? 4 : 3;
	    }
	  }, {
	    key: "_handleResize",
	    value: function _handleResize() {
	      var documentWidth = document.body.clientWidth;

	      if (documentWidth <= this.constructor.ROW_MIN_WIDTH.ONE_COLUMN) {
	        this._itemNavigation.rowSize = 1;
	      } else if (documentWidth <= this.constructor.ROW_MIN_WIDTH.THREE_COLUMN || this.items.length <= 6) {
	        this._itemNavigation.rowSize = 3;
	      } else {
	        this._itemNavigation.rowSize = 4;
	      }
	    }
	  }, {
	    key: "_onfocusin",
	    value: function _onfocusin(event) {
	      var target = event.target;

	      this._itemNavigation.update(target);
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
	    key: "styles",
	    get: function get() {
	      return ProductSwitchCss;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main;
	    }
	  }, {
	    key: "ROW_MIN_WIDTH",
	    get: function get() {
	      return {
	        ONE_COLUMN: 600,
	        THREE_COLUMN: 900
	      };
	    }
	  }]);

	  return ProductSwitch;
	}(__chunk_1.UI5Element);

	ProductSwitch.define();

	return ProductSwitch;

});
//# sourceMappingURL=ProductSwitch.js.map
