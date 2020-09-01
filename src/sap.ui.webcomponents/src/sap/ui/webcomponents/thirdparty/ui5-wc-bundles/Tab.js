sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-1be5f319', './chunk-04be579f', './chunk-6d950724', './chunk-928b5964', './chunk-2e860beb', './chunk-b83f2514', './chunk-1b10f44e', './chunk-e8d699d1', './chunk-5daccaed', './chunk-fd3246cd', './chunk-124ca1de', './chunk-35c39de2', './chunk-02a372c1', './chunk-39e0e4ab', './chunk-11f58424', './chunk-35c756ba', './chunk-390485da', './chunk-47035d43', './chunk-81e00f35', './chunk-8b7daeae', './chunk-c52baa5e', './chunk-7e1c675d', './chunk-2ca5b205', './chunk-b4193b36', './chunk-9a9fd291', './chunk-a1b7ce0b', './chunk-eb92f29a', './chunk-c724d191'], function (__chunk_1, __chunk_2, __chunk_3, __chunk_5, __chunk_6, __chunk_7, __chunk_8, __chunk_9, __chunk_10, __chunk_11, __chunk_12, __chunk_13, __chunk_14, __chunk_15, __chunk_16, __chunk_17, __chunk_18, __chunk_19, __chunk_20, __chunk_21, __chunk_22, __chunk_23, __chunk_24, __chunk_25, __chunk_26, __chunk_27, __chunk_28, __chunk_29, __chunk_30, __chunk_31, __chunk_32, __chunk_36, __chunk_40, __chunk_43, __chunk_44) { 'use strict';

	/**
	 * @lends sap.ui.webcomponents.main.types.SemanticColor.prototype
	 * @public
	 */

	var SemanticColors = {
	  /**
	   * Default color (brand color)
	   * @public
	   * @type {Default}
	   */
	  Default: "Default",

	  /**
	   * Positive color
	   * @public
	   * @type {Positive}
	   */
	  Positive: "Positive",

	  /**
	   * Negative color
	   * @public
	   * @type {Negative}
	   */
	  Negative: "Negative",

	  /**
	   * Critical color
	   * @public
	   * @type {Critical}
	   */
	  Critical: "Critical",

	  /**
	   * Neutral color.
	   * @public
	   * @type {Neutral}
	   */
	  Neutral: "Neutral"
	};
	/**
	 * @class
	 * Defines the semantic color
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.SemanticColor
	 * @public
	 * @enum {string}
	 */

	var SemanticColor =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(SemanticColor, _DataType);

	  function SemanticColor() {
	    __chunk_1._classCallCheck(this, SemanticColor);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(SemanticColor).apply(this, arguments));
	  }

	  __chunk_1._createClass(SemanticColor, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!SemanticColors[value];
	    }
	  }]);

	  return SemanticColor;
	}(__chunk_1.DataType);

	SemanticColor.generataTypeAcessors(SemanticColors);

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div id=\"", "\" class=\"ui5-tab-root\"><slot></slot></div>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.ifDefined(context._id));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	function _templateObject7() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-tab-strip-itemAdditionalText\" id=\"", "-additionalText\">", "</span>"]);

	  _templateObject7 = function _templateObject7() {
	    return data;
	  };

	  return data;
	}

	function _templateObject6() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject6 = function _templateObject6() {
	    return data;
	  };

	  return data;
	}

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-tab-strip-itemText\" id=\"", "-text\"><span class=\"", "\"></span>", "</span>"]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-tab-strip-itemAdditionalText\" id=\"", "-additionalText\">", "</span>"]);

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
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-tab-strip-item-icon-outer\"><ui5-icon name=\"", "\" class=\"ui5-tab-strip-item-icon\"></ui5-icon></div>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<li id=\"", "\" class=\"", "\" tabindex=\"", "\" role=\"tab\" aria-posinset=\"", "\" aria-setsize=\"", "\" aria-controls=\"ui5-tc-contentItem-", "\" aria-selected=\"", "\" aria-disabled=\"", "\" ?disabled=\"", "\" aria-labelledby=\"", "\" data-ui5-stable=\"", "\" style=\"list-style-type: none;\">", "<div class=\"ui5-tab-strip-itemContent\">", "", "", "</div></li><!-- Additional text --> "]);

	  _templateObject$1 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$1 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$1(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.headerClasses), __chunk_2.ifDefined(context._tabIndex), __chunk_2.ifDefined(context._posinset), __chunk_2.ifDefined(context._setsize), __chunk_2.ifDefined(context._posinset), __chunk_2.ifDefined(context.effectiveSelected), __chunk_2.ifDefined(context.effectiveDisabled), context.effectiveDisabled, __chunk_2.ifDefined(context.ariaLabelledBy), __chunk_2.ifDefined(context.stableDomRef), context.icon ? block1(context) : undefined, !context._isInline ? block2(context) : undefined, context.text ? block4(context) : undefined, context._isInline ? block5(context) : undefined);
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), __chunk_2.ifDefined(context.icon));
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), context.additionalText ? block3(context) : undefined);
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.additionalText));
	};

	var block4 = function block4(context) {
	  return __chunk_2.scopedHtml(_templateObject5(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.headerSemanticIconClasses), __chunk_2.ifDefined(context.text));
	};

	var block5 = function block5(context) {
	  return __chunk_2.scopedHtml(_templateObject6(), context.additionalText ? block6(context) : undefined);
	};

	var block6 = function block6(context) {
	  return __chunk_2.scopedHtml(_templateObject7(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.additionalText));
	};

	var main$1 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$1(context);
	};

	function _templateObject3$1() {
	  var data = __chunk_1._taggedTemplateLiteral([" (", ") "]);

	  _templateObject3$1 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-icon name=\"", "\"></ui5-icon>"]);

	  _templateObject2$1 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject$2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-li-custom id=\"", "\" class=\"", "\" type=\"", "\" ?selected=\"", "\" ?disabled=\"", "\" aria-disabled=\"", "\" aria-selected=\"", "\" aria-labelledby=\"", "\"><div class=\"ui5-tab-overflow-itemContent\">", "", "", "</div></ui5-li-custom>"]);

	  _templateObject$2 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$2 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$2(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.overflowClasses), __chunk_2.ifDefined(context.overflowState), context.effectiveSelected, context.effectiveDisabled, __chunk_2.ifDefined(context.effectiveDisabled), __chunk_2.ifDefined(context.effectiveSelected), __chunk_2.ifDefined(context.ariaLabelledBy), context.icon ? block1$1(context) : undefined, __chunk_2.ifDefined(context.text), context.additionalText ? block2$1(context) : undefined);
	};

	var block1$1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2$1(), __chunk_2.ifDefined(context.icon));
	};

	var block2$1 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3$1(), __chunk_2.ifDefined(context.additionalText));
	};

	var main$2 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$2(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var css = ":host{display:inline-block;width:100%}.ui5-tab-root{width:100%;height:100%}";

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var stripCss = ".ui5-tab-strip-item{color:var(--_ui5_tc_headerItem_color);cursor:pointer;flex-shrink:0;margin:0 1rem;font-size:var(--sapFontSmallSize);text-shadow:var(--sapContent_TextShadow);position:relative;display:inline-flex;align-items:center}.ui5-tab-strip-item:last-child{margin-right:0}.ui5-tab-strip-itemContent{pointer-events:none}.ui5-tab-strip-item--selected.ui5-tab-strip-item--textOnly{color:var(--_ui5_tc_headeritem_text_selected_color)}.ui5-tab-strip-item--selected.ui5-tab-strip-item--mixedMode .ui5-tab-strip-itemContent:after,.ui5-tab-strip-item--selected.ui5-tab-strip-item--textOnly .ui5-tab-strip-itemContent:after,.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon-outer:after{content:\"\";position:absolute;width:100%;bottom:0;left:0;border-bottom:var(--_ui5_tc_headerItemContent_border_bottom)}.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon-outer:after{bottom:-.8rem}.ui5-tab-strip-item--disabled{cursor:default;opacity:.5}.ui5-tab-strip-item:focus{outline:none}.ui5-tab-strip-item--textOnly:not(.ui5-tab-strip-item--inline):focus .ui5-tab-strip-itemText,.ui5-tab-strip-item--withIcon:focus .ui5-tab-strip-item-icon-outer{outline:var(--_ui5_tc_headerItem_focus_border)}.ui5-tab-strip-item--inline.ui5-tab-strip-item--textOnly:focus .ui5-tab-strip-itemContent,.ui5-tab-strip-item--mixedMode:focus .ui5-tab-strip-itemContent{outline:var(--_ui5_tc_headerItem_focus_border)}.ui5-tab-strip-item-semanticIcon:before{display:var(--_ui5_tc_headerItemSemanticIcon_display);font-family:SAP-icons;font-size:.75rem;margin-right:.25rem;speak:none;-webkit-font-smoothing:antialiased}.ui5-tab-strip-item-semanticIcon--positive:before{content:\"\\e1ab\"}.ui5-tab-strip-item-semanticIcon--negative:before{content:\"\\e1ac\"}.ui5-tab-strip-item-semanticIcon--critical:before{content:\"\\e1ae\"}.ui5-tab-strip-item--mixedMode,.ui5-tab-strip-item--withIcon{margin-top:.75rem;padding-bottom:.75rem}.ui5-tab-strip-item-icon-outer{display:flex;justify-content:center;align-items:center;position:relative;border:var(--_ui5_tc_headerItemIcon_border);border-radius:50%;margin-right:.25rem;height:var(--_ui5_tc_item_text);width:var(--_ui5_tc_item_text);pointer-events:none}.ui5-tab-strip-item-icon{width:var(--_ui5_tc_item_icon_size);height:var(--_ui5_tc_item_icon_size);color:var(--_ui5_tc_headerItemIcon_color);text-shadow:var(--sapContent_TextShadow);pointer-events:none}.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon-outer{background-color:var(--_ui5_tc_headerItemIcon_selected_background)}.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon{color:var(--_ui5_tc_headerItemIcon_selected_color);text-shadow:none}.ui5-tab-strip-itemAdditionalText+.ui5-tab-strip-itemText{display:block}.ui5-tab-strip-item--inline .ui5-tab-strip-itemAdditionalText+.ui5-tab-strip-itemText{display:inline}.ui5-tab-strip-item--withIcon .ui5-tab-strip-itemAdditionalText+.ui5-tab-strip-itemText{margin-top:var(--_ui5_tc_item_add_text_margin_top)}.ui5-tab-strip-item--textOnly{font-size:var(--sapFontSize);height:var(--_ui5_tc_item_text_text_only);display:flex;align-items:center;line-height:var(--_ui5_tc_item_text_line_height)}.ui5-tab-strip-item--mixedMode .ui5-tab-strip-itemAdditionalText,.ui5-tab-strip-item--mixedMode .ui5-tab-strip-itemText{display:inline-block;vertical-align:middle}.ui5-tab-strip-item--mixedMode .ui5-tab-strip-itemAdditionalText{font-size:1.5rem;margin-right:.5rem}.ui5-tab-strip-item--positive.ui5-tab-strip-item--textOnly,.ui5-tab-strip-item--positive .ui5-tab-strip-item-icon-outer,.ui5-tab-strip-item-semanticIcon--positive:before{color:var(--sapPositiveColor);border-color:var(--_ui5_tc_headerItem_positive_selected_border_color)}.ui5-tab-strip-item--positive .ui5-tab-strip-item-icon{color:var(--_ui5_tc_headerItem_positive_color)}.ui5-tab-strip-item--positive.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon-outer{background-color:var(--_ui5_tc_headerItemIcon_positive_selected_background);color:var(--_ui5_tc_headerItemIcon_semantic_selected_color)}.ui5-tab-strip-item--positive.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon{color:var(--_ui5_tc_headerItemIcon_semantic_selected_color)}.ui5-tab-strip-item--positive .ui5-tab-strip-item-icon-outer:after,.ui5-tab-strip-item.ui5-tab-strip-item--positive .ui5-tab-strip-itemContent:after{border-color:var(--_ui5_tc_headerItem_positive_border_color)}.ui5-tab-strip-item--negative.ui5-tab-strip-item--textOnly,.ui5-tab-strip-item--negative .ui5-tab-strip-item-icon-outer,.ui5-tab-strip-item-semanticIcon--negative:before{color:var(--sapNegativeColor);border-color:var(--_ui5_tc_headerItem_negative_selected_border_color)}.ui5-tab-strip-item--negative .ui5-tab-strip-item-icon{color:var(--_ui5_tc_headerItem_negative_color)}.ui5-tab-strip-item--negative.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon-outer{background-color:var(--_ui5_tc_headerItemIcon_negative_selected_background)}.ui5-tab-strip-item--negative.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon{color:var(--_ui5_tc_headerItemIcon_semantic_selected_color)}.ui5-tab-strip-item--negative .ui5-tab-strip-item-icon-outer:after,.ui5-tab-strip-item.ui5-tab-strip-item--negative .ui5-tab-strip-itemContent:after{border-color:var(--_ui5_tc_headerItem_negative_border_color)}.ui5-tab-strip-item--critical.ui5-tab-strip-item--textOnly,.ui5-tab-strip-item--critical .ui5-tab-strip-item-icon-outer,.ui5-tab-strip-item-semanticIcon--critical:before{color:var(--sapCriticalColor);border-color:var(--_ui5_tc_headerItem_critical_selected_border_color)}.ui5-tab-strip-item--critical .ui5-tab-strip-item-icon{color:var(--_ui5_tc_headerItem_critical_color)}.ui5-tab-strip-item--critical.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon-outer{background-color:var(--_ui5_tc_headerItemIcon_critical_selected_background)}.ui5-tab-strip-item--critical.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon{color:var(--_ui5_tc_headerItemIcon_semantic_selected_color)}.ui5-tab-strip-item--critical .ui5-tab-strip-item-icon-outer:after,.ui5-tab-strip-item.ui5-tab-strip-item--critical .ui5-tab-strip-itemContent:after{border-color:var(--_ui5_tc_headerItem_critical_border_color)}.ui5-tab-strip-item--neutral .ui5-tab-strip-item-icon-outer,.ui5-tab-strip-item--nutral.ui5-tab-strip-item--textOnly{color:var(--sapNeutralColor);border-color:var(--_ui5_tc_headerItem_neutral_selected_border_color)}.ui5-tab-strip-item--neutral .ui5-tab-strip-item-icon{color:var(--_ui5_tc_headerItem_neutral_color)}.ui5-tab-strip-item--neutral.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon-outer{background-color:var(--_ui5_tc_headerItemIcon_neutral_selected_background)}.ui5-tab-strip-item--neutral.ui5-tab-strip-item--selected .ui5-tab-strip-item-icon{color:var(--_ui5_tc_headerItemIcon_semantic_selected_color)}.ui5-tab-strip-item--neutral .ui5-tab-strip-item-icon:after,.ui5-tab-strip-items.ui5-tab-strip-item--neutral .ui5-tab-strip-itemContent:after{border-color:var(--_ui5_tc_headerItem_neutral_border_color)}[dir=rtl] .ui5-tab-strip-item:last-child{margin-left:0}[dir=rtl] .ui5-tab-strip-item-semanticIcon:before{margin-left:.25rem;margin-right:0}[dir=rtl] .ui5-tab-strip-item-icon-outer{margin-left:.25rem;margin-right:0}[dir=rtl] .ui5-tab-strip-item--mixedMode .ui5-tab-strip-itemAdditionalText{margin-right:0;margin-left:.5rem}";

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var overflowCss = ".ui5-tab-overflow-item{color:var(--_ui5_tc_overflowItem_default_color)}.ui5-tab-overflow-item--disabled{cursor:default;opacity:.5}.ui5-tab-overflow-item--positive{color:var(--_ui5_tc_overflowItem_positive_color);border-color:var(--_ui5_tc_headerItem_positive_selected_border_color)}.ui5-tab-overflow-item--negative{color:var(--_ui5_tc_overflowItem_negative_color);border-color:var(--_ui5_tc_headerItem_negative_selected_border_color)}.ui5-tab-overflow-item--critical{color:var(--_ui5_tc_overflowItem_critical_color);border-color:var(--_ui5_tc_headerItem_critical_selected_border_color)}.ui5-tab-overflow-item--neutral{color:var(--_ui5_tc_overflowItem_neutral_color);border-color:var(--_ui5_tc_headerItem_neutral_selected_border_color)}.ui5-tab-overflow-item[active] .ui5-tab-overflow-itemContent{color:var(--sapList_Active_TextColor)}.ui5-tab-overflow-itemContent{display:flex;align-items:center;padding:0 .5rem;height:var(--_ui5_tc_item_text);pointer-events:none}.ui5-tab-overflow-item [ui5-icon]{width:1.375rem;height:1.375rem;padding-right:1rem;color:var(--_ui5_tc_overflowItem_current_color)}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-tab",
	  slots:
	  /** @lends sap.ui.webcomponents.main.Tab.prototype */
	  {
	    /**
	     * Defines the tab content.
	     * @type {Node[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      type: Node
	    }
	  },
	  properties:
	  /** @lends sap.ui.webcomponents.main.Tab.prototype */
	  {
	    /**
	     * The text to be displayed for the item.
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    text: {
	      type: String
	    },

	    /**
	     * Enabled items can be selected.
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    disabled: {
	      type: Boolean
	    },

	    /**
	     * Represents the "additionalText" text, which is displayed in the tab filter.
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    additionalText: {
	      type: String
	    },

	    /**
	     * Defines the icon source URI to be displayed as graphical element within the <code>ui5-tab</code>.
	     * The SAP-icons font provides numerous built-in icons.
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
	     * Defines the <code>ui5-tab</code> semantic color.
	     * <br><br>
	     * The color is applied to:
	     * <ul>
	     * <li>the <code>ui5-tab</code> icon</li>
	     * <li>the <code>text</code> when <code>ui5-tab</code> overflows</li>
	     * <li>the tab selection line</li>
	     * </ul>
	     *
	     * <br><br>
	     * Available semantic colors are: <code>"Default"</code>, <code>"Neutral"</code>, <code>"Positive"</code>, <code>"Critical"</code> and <code>"Negative"</code>.
	     *
	     * <br><br>
	     * <b>Note:</b> The color value depends on the current theme.
	     * @type {SemanticColor}
	     * @defaultvalue "Default"
	     * @public
	     */
	    semanticColor: {
	      type: SemanticColor,
	      defaultValue: SemanticColor.Default
	    },

	    /**
	     * Defines the stable selector that you can use via getStableDomRef method.
	     * @public
	     * @since 1.0.0-rc.8
	     */
	    stableDomRef: {
	      type: String
	    },

	    /**
	     * Specifies if the <code>ui5-tab</code> is selected.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    selected: {
	      type: Boolean
	    },
	    _tabIndex: {
	      type: String,
	      defaultValue: "-1",
	      noAttribute: true
	    }
	  },
	  events:
	  /** @lends sap.ui.webcomponents.main.Tab.prototype */
	  {}
	};
	/**
	 * @class
	 * The <code>ui5-tab</code> represents a selectable item inside a <code>ui5-tabcontainer</code>.
	 * It defines both the item in the tab strip (top part of the <code>ui5-tabcontainer</code>) and the
	 * content that is presented to the user once the tab is selected.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Tab
	 * @extends UI5Element
	 * @tagname ui5-tab
	 * @public
	 */

	var Tab =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Tab, _UI5Element);

	  function Tab() {
	    __chunk_1._classCallCheck(this, Tab);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Tab).apply(this, arguments));
	  }

	  __chunk_1._createClass(Tab, [{
	    key: "getFocusDomRef",
	    value: function getFocusDomRef() {
	      var focusedDomRef = __chunk_1._get(__chunk_1._getPrototypeOf(Tab.prototype), "getFocusDomRef", this).call(this);

	      if (this._getTabContainerHeaderItemCallback) {
	        focusedDomRef = this._getTabContainerHeaderItemCallback();
	      }

	      return focusedDomRef;
	    }
	  }, {
	    key: "isSeparator",
	    get: function get() {
	      return false;
	    }
	  }, {
	    key: "stripPresentation",
	    get: function get() {
	      return __chunk_1.executeTemplate(this.constructor.stripTemplate, this);
	    }
	  }, {
	    key: "overflowPresentation",
	    get: function get() {
	      return __chunk_1.executeTemplate(this.constructor.overflowTemplate, this);
	    }
	  }, {
	    key: "isMixedModeTab",
	    get: function get() {
	      return !this.icon && this._mixedMode;
	    }
	  }, {
	    key: "isTextOnlyTab",
	    get: function get() {
	      return !this.icon && !this._mixedMode;
	    }
	  }, {
	    key: "isIconTab",
	    get: function get() {
	      return !!this.icon;
	    }
	  }, {
	    key: "effectiveDisabled",
	    get: function get() {
	      return this.disabled || undefined;
	    }
	  }, {
	    key: "effectiveSelected",
	    get: function get() {
	      return this.selected || false;
	    }
	  }, {
	    key: "effectiveHidden",
	    get: function get() {
	      return !this.selected;
	    }
	  }, {
	    key: "ariaLabelledBy",
	    get: function get() {
	      var labels = [];

	      if (this.text) {
	        labels.push("".concat(this._id, "-text"));
	      }

	      if (this.additionalText) {
	        labels.push("".concat(this._id, "-additionalText"));
	      }

	      if (this.icon) {
	        labels.push("".concat(this._id, "-icon"));
	      }

	      return labels.join(" ");
	    }
	  }, {
	    key: "headerClasses",
	    get: function get() {
	      var classes = ["ui5-tab-strip-item"];

	      if (this.selected) {
	        classes.push("ui5-tab-strip-item--selected");
	      }

	      if (this.disabled) {
	        classes.push("ui5-tab-strip-item--disabled");
	      }

	      if (this.tabLayout === __chunk_44.TabLayout.Inline) {
	        classes.push("ui5-tab-strip-item--inline");
	      }

	      if (!this.icon && !this._mixedMode) {
	        classes.push("ui5-tab-strip-item--textOnly");
	      }

	      if (this.icon) {
	        classes.push("ui5-tab-strip-item--withIcon");
	      }

	      if (!this.icon && this._mixedMode) {
	        classes.push("ui5-tab-strip-item--mixedMode");
	      }

	      if (this.semanticColor !== SemanticColor.Default) {
	        classes.push("ui5-tab-strip-item--".concat(this.semanticColor.toLowerCase()));
	      }

	      return classes.join(" ");
	    }
	  }, {
	    key: "headerSemanticIconClasses",
	    get: function get() {
	      var classes = ["ui5-tab-strip-item-semanticIcon"];

	      if (this.semanticColor !== SemanticColor.Default) {
	        classes.push("ui5-tab-strip-item-semanticIcon--".concat(this.semanticColor.toLowerCase()));
	      }

	      return classes.join(" ");
	    }
	  }, {
	    key: "overflowClasses",
	    get: function get() {
	      var classes = ["ui5-tab-overflow-item"];

	      if (this.semanticColor !== SemanticColor.Default) {
	        classes.push("ui5-tab-overflow-item--".concat(this.semanticColor.toLowerCase()));
	      }

	      if (this.disabled) {
	        classes.push("ui5-tab-overflow-item--disabled");
	      }

	      return classes.join(" ");
	    }
	  }, {
	    key: "overflowState",
	    get: function get() {
	      return this.disabled ? "Inactive" : "Active";
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
	    key: "stripTemplate",
	    get: function get() {
	      return main$1;
	    }
	  }, {
	    key: "overflowTemplate",
	    get: function get() {
	      return main$2;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return css;
	    }
	  }, {
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_9.Icon, __chunk_23.CustomListItem];
	    }
	  }]);

	  return Tab;
	}(__chunk_1.UI5Element);

	Tab.define();
	__chunk_44.TabContainer.registerTabStyles(stripCss);
	__chunk_44.TabContainer.registerStaticAreaTabStyles(overflowCss);

	return Tab;

});
//# sourceMappingURL=Tab.js.map
