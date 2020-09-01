sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-e8d699d1'], function (exports, __chunk_1, __chunk_2, __chunk_6, __chunk_7, __chunk_16) { 'use strict';

	function _templateObject10() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-li-deletebtn\"><ui5-button id=\"", "-deleteSelectionElement\" design=\"Transparent\" icon=\"decline\" @click=\"", "\" title=\"", "\"></ui5-button></div>"]);

	  _templateObject10 = function _templateObject10() {
	    return data;
	  };

	  return data;
	}

	function _templateObject9() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-checkbox ?disabled=\"", "\" tabindex=\"-1\" id=\"", "-multiSelectionElement\" class=\"ui5-li-multisel-cb\" ?checked=\"", "\" aria-label=\"", "\" @click=\"", "\"></ui5-checkbox>"]);

	  _templateObject9 = function _templateObject9() {
	    return data;
	  };

	  return data;
	}

	function _templateObject8() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-radiobutton ?disabled=\"", "\" tabindex=\"-1\" id=\"", "-singleSelectionElement\" class=\"ui5-li-singlesel-radiobtn\" ?selected=\"", "\" @click=\"", "\"></ui5-radiobutton>"]);

	  _templateObject8 = function _templateObject8() {
	    return data;
	  };

	  return data;
	}

	function _templateObject7() {
	  var data = __chunk_1._taggedTemplateLiteral(["", "", "", ""]);

	  _templateObject7 = function _templateObject7() {
	    return data;
	  };

	  return data;
	}

	function _templateObject6() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-li-detailbtn\"><ui5-button design=\"Transparent\" icon=\"edit\" @click=\"", "\"></ui5-button></div>"]);

	  _templateObject6 = function _templateObject6() {
	    return data;
	  };

	  return data;
	}

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-li-deletebtn\"><ui5-button id=\"", "-deleteSelectionElement\" design=\"Transparent\" icon=\"decline\" @click=\"", "\" title=\"", "\"></ui5-button></div>"]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-checkbox ?disabled=\"", "\" tabindex=\"-1\" id=\"", "-multiSelectionElement\" class=\"ui5-li-multisel-cb\" ?checked=\"", "\" aria-label=\"", "\" @click=\"", "\"></ui5-checkbox>"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-radiobutton ?disabled=\"", "\" tabindex=\"-1\" id=\"", "-singleSelectionElement\" class=\"ui5-li-singlesel-radiobtn\" ?selected=\"", "\" @click=\"", "\"></ui5-radiobutton>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["", "", "", ""]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<li tabindex=\"", "\" class=\"", "\" dir=\"", "\" @focusin=\"", "\" @focusout=\"", "\" @keyup=\"", "\" @keydown=\"", "\" @mouseup=\"", "\" @mousedown=\"", "\" @touchstart=\"", "\" @touchend=\"", "\" @click=\"", "\" aria-selected=\"", "\" role=\"", "\" aria-expanded=\"", "\" aria-level=\"", "\" style=\"list-style-type: none;\">", "<div id=\"", "-content\" class=\"ui5-li-content\"><slot></slot></div>", "", "</li> "]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.ifDefined(context._tabIndex), __chunk_2.classMap(context.classes.main), __chunk_2.ifDefined(context.effectiveDir), context._onfocusin, context._onfocusout, context._onkeyup, context._onkeydown, context._onmouseup, context._onmousedown, context._ontouchstart, context._ontouchend, context._onclick, __chunk_2.ifDefined(context.ariaSelected), __chunk_2.ifDefined(context._accInfo.role), __chunk_2.ifDefined(context._accInfo.ariaExpanded), __chunk_2.ifDefined(context._accInfo.ariaLevel), context.placeSelectionElementBefore ? block1(context) : undefined, __chunk_2.ifDefined(context._id), context.typeDetail ? block5(context) : undefined, context.placeSelectionElementAfter ? block6(context) : undefined);
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), context.modeSingleSelect ? block2(context) : undefined, context.modeMultiSelect ? block3(context) : undefined, context.modeDelete ? block4(context) : undefined);
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), context.isInactive, __chunk_2.ifDefined(context._id), context.selected, context.onSingleSelectionComponentPress);
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4(), context.isInactive, __chunk_2.ifDefined(context._id), context.selected, __chunk_2.ifDefined(context._accInfo.ariaLabel), context.onMultiSelectionComponentPress);
	};

	var block4 = function block4(context) {
	  return __chunk_2.scopedHtml(_templateObject5(), __chunk_2.ifDefined(context._id), context.onDelete, __chunk_2.ifDefined(context.deleteText));
	};

	var block5 = function block5(context) {
	  return __chunk_2.scopedHtml(_templateObject6(), context.onDetailClick);
	};

	var block6 = function block6(context) {
	  return __chunk_2.scopedHtml(_templateObject7(), context.modeSingleSelect ? block7(context) : undefined, context.modeMultiSelect ? block8(context) : undefined, context.modeDelete ? block9(context) : undefined);
	};

	var block7 = function block7(context) {
	  return __chunk_2.scopedHtml(_templateObject8(), context.isInactive, __chunk_2.ifDefined(context._id), context.selected, context.onSingleSelectionComponentPress);
	};

	var block8 = function block8(context) {
	  return __chunk_2.scopedHtml(_templateObject9(), context.isInactive, __chunk_2.ifDefined(context._id), context.selected, __chunk_2.ifDefined(context._accInfo.ariaLabel), context.onMultiSelectionComponentPress);
	};

	var block9 = function block9(context) {
	  return __chunk_2.scopedHtml(_templateObject10(), __chunk_2.ifDefined(context._id), context.onDelete, __chunk_2.ifDefined(context.deleteText));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var customListItemCss = ":host(:not([hidden])){display:block}:host{height:var(--_ui5_custom_list_item_height);box-sizing:border-box}.ui5-li-root.ui5-custom-li-root{padding:0;pointer-events:inherit}.ui5-li-root.ui5-custom-li-root .ui5-li-content{pointer-events:inherit}[ui5-checkbox].ui5-li-singlesel-radiobtn,[ui5-radiobutton].ui5-li-singlesel-radiobtn{display:flex;align-items:center}.ui5-li-root.ui5-custom-li-root,[ui5-checkbox].ui5-li-singlesel-radiobtn,[ui5-radiobutton].ui5-li-singlesel-radiobtn{min-width:var(--_ui5_custom_list_item_rb_min_width)}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-li-custom",
	  slots:
	  /** @lends sap.ui.webcomponents.main.CustomListItem.prototype */
	  {
	    /**
	     * Defines the content of the <code>ui5-li-custom</code>.
	     * @type {Node[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      type: Node
	    }
	  },
	  properties:
	  /** @lends sap.ui.webcomponents.main.CustomListItem.prototype */
	  {}
	};
	/**
	 * @class
	 *
	 * A component to be used as custom list item within the <code>ui5-list</code>
	 * the same way as the standard <code>ui5-li</code>.
	 *
	 * The <code>ui5-li-custom</code> accepts arbitrary HTML content to allow full customization.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.CustomListItem
	 * @extends ListItem
	 * @tagname ui5-li-custom
	 * @public
	 */

	var CustomListItem =
	/*#__PURE__*/
	function (_ListItem) {
	  __chunk_1._inherits(CustomListItem, _ListItem);

	  function CustomListItem() {
	    __chunk_1._classCallCheck(this, CustomListItem);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(CustomListItem).apply(this, arguments));
	  }

	  __chunk_1._createClass(CustomListItem, [{
	    key: "classes",
	    get: function get() {
	      var result = __chunk_1._get(__chunk_1._getPrototypeOf(CustomListItem.prototype), "classes", this);

	      result.main["ui5-custom-li-root"] = true;
	      return result;
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
	      return [__chunk_16.ListItem.styles, customListItemCss];
	    }
	  }]);

	  return CustomListItem;
	}(__chunk_16.ListItem);

	CustomListItem.define();

	exports.CustomListItem = CustomListItem;

});
//# sourceMappingURL=chunk-11f58424.js.map
