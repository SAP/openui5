sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-1be5f319', './chunk-8f81354a'], function (__chunk_1, __chunk_2, __chunk_3, __chunk_6, __chunk_7, __chunk_8, __chunk_9, __chunk_42) { 'use strict';

	function _templateObject9() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-product-switch-item-subtitle\">", "</span>"]);

	  _templateObject9 = function _templateObject9() {
	    return data;
	  };

	  return data;
	}

	function _templateObject8() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-product-switch-item-heading\">", "</span>"]);

	  _templateObject8 = function _templateObject8() {
	    return data;
	  };

	  return data;
	}

	function _templateObject7() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-icon class=\"ui5-product-switch-item-icon\" name=\"", "\"></ui5-icon>"]);

	  _templateObject7 = function _templateObject7() {
	    return data;
	  };

	  return data;
	}

	function _templateObject6() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-product-switch-item-root\" data-sap-focus-ref @focusout=\"", "\" @focusin=\"", "\" @mousedown=\"", "\" @keydown=\"", "\" @keyup=\"", "\" tabindex=", ">", "<span class=\"ui5-product-switch-item-text-content\">", "", "</span></div>"]);

	  _templateObject6 = function _templateObject6() {
	    return data;
	  };

	  return data;
	}

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-product-switch-item-subtitle\">", "</span>"]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-product-switch-item-heading\">", "</span>"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-icon class=\"ui5-product-switch-item-icon\" name=\"", "\"></ui5-icon>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<a class=\"ui5-product-switch-item-root\" data-sap-focus-ref @focusout=\"", "\" @focusin=\"", "\" @mousedown=\"", "\" @keydown=\"", "\" @keyup=\"", "\" tabindex=", " href=\"", "\" target=\"", "\">", "<span class=\"ui5-product-switch-item-text-content\">", "", "</span></a>"]);

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
	  return __chunk_2.scopedHtml(_templateObject(), context.targetSrc ? block1(context) : block5(context));
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), context._onfocusout, context._onfocusin, context._onmousedown, context._onkeydown, context._onkeyup, __chunk_2.ifDefined(context._tabIndex), __chunk_2.ifDefined(context.targetSrc), __chunk_2.ifDefined(context.target), context.icon ? block2(context) : undefined, context.heading ? block3(context) : undefined, context.subtitle ? block4(context) : undefined);
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(context.icon));
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4(), __chunk_2.ifDefined(context.heading));
	};

	var block4 = function block4(context) {
	  return __chunk_2.scopedHtml(_templateObject5(), __chunk_2.ifDefined(context.subtitle));
	};

	var block5 = function block5(context) {
	  return __chunk_2.scopedHtml(_templateObject6(), context._onfocusout, context._onfocusin, context._onmousedown, context._onkeydown, context._onkeyup, __chunk_2.ifDefined(context._tabIndex), context.icon ? block6(context) : undefined, context.heading ? block7(context) : undefined, context.subtitle ? block8(context) : undefined);
	};

	var block6 = function block6(context) {
	  return __chunk_2.scopedHtml(_templateObject7(), __chunk_2.ifDefined(context.icon));
	};

	var block7 = function block7(context) {
	  return __chunk_2.scopedHtml(_templateObject8(), __chunk_2.ifDefined(context.heading));
	};

	var block8 = function block8(context) {
	  return __chunk_2.scopedHtml(_templateObject9(), __chunk_2.ifDefined(context.subtitle));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents-fiori", "sap_fiori_3", __chunk_42.defaultTheme);
	var ProductSwitchItemCss = ":host{width:var(--_ui5_product_switch_item_width);height:var(--_ui5_product_switch_item_height);margin:.25rem;border-radius:.25rem;box-sizing:border-box;background:var(--sapList_Background)}:host(:hover){background:var(--sapList_Hover_Background)}:host([active]){background:var(--sapList_Active_Background)}:host([active]) .ui5-product-switch-item-root .ui5-product-switch-item-icon,:host([active]) .ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-heading,:host([active]) .ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-subtitle{color:var(--sapList_Active_TextColor)}:host([focused]){outline:var(--_ui5_product_switch_item_outline);outline-offset:var(--_ui5_product_switch_item_outline_offset)}:host([active][focused]){outline-color:var(--_ui5_product_switch_item_active_outline_color)}.ui5-product-switch-item-root{user-select:none;-ms-user-select:none;width:100%;height:100%;flex-direction:column;display:flex;align-items:center;text-decoration:none;outline:none;box-sizing:border-box;padding:.5rem;padding-top:4rem;cursor:pointer;border:var(--_ui5_product_switch_item_border)}:host([icon]) .ui5-product-switch-item-root{padding-top:.5rem}.ui5-product-switch-item-root .ui5-product-switch-item-icon{width:3rem;height:3rem;padding:.75rem;margin-bottom:.5rem;box-sizing:border-box;color:var(--sapContent_IconColor);pointer-events:none}.ui5-product-switch-item-root .ui5-product-switch-item-text-content{display:flex;align-items:center;flex-direction:column;max-width:10.25rem}.ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-heading,.ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-subtitle{line-height:1.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;pointer-events:none}.ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-heading{font-size:var(--sapMFontHeader6Size);color:var(--sapGroup_TitleTextColor)}.ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-subtitle{font-size:var(--sapFontSmallSize);color:var(--sapContent_LabelColor)}@media only screen and (max-width:600px){:host{margin:0;width:100%;max-width:600px;height:5rem;border-radius:0}.ui5-product-switch-item-root{padding:0 1rem;flex-direction:row}:host([icon]) .ui5-product-switch-item-root{padding-top:0}.ui5-product-switch-item-root .ui5-product-switch-item-icon{padding:.875rem;color:var(--sapContent_NonInteractiveIconColor);margin:0 .75rem 0 0}.ui5-product-switch-item-root .ui5-product-switch-item-text-content{align-items:flex-start;max-width:100%}:host([icon]) .ui5-product-switch-item-root .ui5-product-switch-item-text-content{max-width:calc(100% - 3.75rem)}.ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-heading,.ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-subtitle{line-height:normal}.ui5-product-switch-item-root .ui5-product-switch-item-text-content .ui5-product-switch-item-subtitle{font-size:var(--sapFontSize);padding-top:.75rem}}[ui5-product-switch-item][focused]{outline:none;position:relative}[ui5-product-switch-item][focused] .ui5-product-switch-item-root:after{content:\"\";position:absolute;border-color:var(--_ui5_product_switch_item_outline_color);border-width:var(--_ui5_product_switch_item_outline_width);border-style:dotted;top:var(--_ui5_product_switch_item_outline_offset_positive);bottom:var(--_ui5_product_switch_item_outline_offset_positive);left:var(--_ui5_product_switch_item_outline_offset_positive);right:var(--_ui5_product_switch_item_outline_offset_positive)}[ui5-product-switch-item][active][focused] .ui5-product-switch-item-root:after{border-color:var(--_ui5_product_switch_item_active_outline_color)}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-product-switch-item",
	  properties:
	  /** @lends sap.ui.webcomponents.fiori.ProductSwitchItem.prototype */
	  {
	    /**
	      * Defines the title of the <code>ui5-product-switch-item</code>.
	      * @type {string}
	      * @defaultvalue ""
	      * @public
	      */
	    heading: {
	      type: String
	    },

	    /**
	     * Defines the subtitle of the <code>ui5-product-switch-item</code>.
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    subtitle: {
	      type: String
	    },

	    /**
	     * Defines the icon to be displayed as a graphical element within the <code>ui5-product-switch-item</code>.
	     * <br><br>
	     * Example:
	     * <br>
	     * <pre>ui5-product-switch-item icon="palette"</pre>
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
	     * Defines a target where the <code>targetSrc</code> content must be open.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>_self</code></li>
	     * <li><code>_top</code></li>
	     * <li><code>_blank</code></li>
	     * <li><code>_parent</code></li>
	     * <li><code>_search</code></li>
	     * </ul>
	     *
	     * @type {string}
	     * @defaultvalue "_self"
	     * @public
	     */
	    target: {
	      type: String,
	      defaultValue: "_self"
	    },

	    /**
	     * Defines the <code>ui5-product-switch-item</code> target URI. Supports standard hyperlink behavior.
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    targetSrc: {
	      type: String
	    },

	    /**
	     * Used to switch the active state (pressed or not) of the <code>ui5-product-switch-item</code>.
	     * @private
	     */
	    active: {
	      type: Boolean
	    },

	    /**
	     * Indicates whether the element is focused.
	     * @private
	     */
	    focused: {
	      type: Boolean
	    },
	    _tabIndex: {
	      type: String,
	      defaultValue: "-1",
	      noAttribute: true
	    }
	  },
	  slots:
	  /** @lends  sap.ui.webcomponents.fiori.ProductSwitchItem.prototype */
	  {},
	  events:
	  /** @lends sap.ui.webcomponents.fiori.ProductSwitchItem.prototype */
	  {
	    /**
	     * Fired when the <code>ui5-product-switch-item</code> is activated either with a
	     * click/tap or by using the Enter or Space key.
	     *
	     * @event
	     * @public
	     */
	    click: {},
	    _focused: {}
	  }
	};
	/**
	 * @class
	 * <h3 class="comment-api-title">Overview</h3>
	 * The <code>ui5-product-switch-item</code> web component represents the items displayed in the
	 * <code>ui5-product-switch</code> web component.
	 * <br><br>
	 * <b>Note:</b> <code>ui5-product-switch-item</code> is not supported when used outside of <code>ui5-product-switch</code>.
	 * <br><br>
	 * <h3>ES6 Module Import</h3>
	 * <code>import "@ui5/webcomponents-fiori/dist/ProductSwitchItem.js";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.fiori.ProductSwitchItem
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-product-switch-item
	 * @public
	 * @since 1.0.0-rc.5
	 */

	var ProductSwitchItem =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(ProductSwitchItem, _UI5Element);

	  function ProductSwitchItem() {
	    var _this;

	    __chunk_1._classCallCheck(this, ProductSwitchItem);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ProductSwitchItem).call(this));

	    _this._deactivate = function () {
	      if (_this.active) {
	        _this.active = false;
	      }
	    };

	    return _this;
	  }

	  __chunk_1._createClass(ProductSwitchItem, [{
	    key: "onEnterDOM",
	    value: function onEnterDOM() {
	      document.addEventListener("mouseup", this._deactivate);
	    }
	  }, {
	    key: "onExitDOM",
	    value: function onExitDOM() {
	      document.removeEventListener("mouseup", this._deactivate);
	    }
	  }, {
	    key: "_onmousedown",
	    value: function _onmousedown() {
	      this.active = true;
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isSpace(event) || __chunk_8.isEnter(event)) {
	        this.active = true;
	      }

	      if (__chunk_8.isSpace(event)) {
	        event.preventDefault();
	      }

	      if (__chunk_8.isEnter(event)) {
	        this._fireItemClick();
	      }
	    }
	  }, {
	    key: "_onkeyup",
	    value: function _onkeyup(event) {
	      if (__chunk_8.isSpace(event) || __chunk_8.isEnter(event)) {
	        this.active = false;
	      }

	      if (__chunk_8.isSpace(event)) {
	        this._fireItemClick();
	      }
	    }
	  }, {
	    key: "_onfocusout",
	    value: function _onfocusout() {
	      this.active = false;
	      this.focused = false;
	    }
	  }, {
	    key: "_onfocusin",
	    value: function _onfocusin(event) {
	      this.focused = true;
	      this.fireEvent("_focused", event);
	    }
	  }, {
	    key: "_fireItemClick",
	    value: function _fireItemClick() {
	      this.fireEvent("click", {
	        item: this
	      });
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
	      return ProductSwitchItemCss;
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

	  return ProductSwitchItem;
	}(__chunk_1.UI5Element);

	ProductSwitchItem.define();

	return ProductSwitchItem;

});
//# sourceMappingURL=ProductSwitchItem.js.map
