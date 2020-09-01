sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-35c39de2'], function (exports, __chunk_1, __chunk_2, __chunk_3, __chunk_5, __chunk_6, __chunk_7, __chunk_20) { 'use strict';

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<li tabindex=\"", "\" class=\"ui5-ghli-root ", "\" @focusin=\"", "\" @focusout=\"", "\" @keydown=\"", "\" role=\"option\" style=\"list-style-type: none;\"><span class=\"ui5-hidden-text\">", "</span><div id=\"", "-content\" class=\"ui5-li-content\"><span class=\"ui5-ghli-title\"><slot></slot></span></div></li>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.ifDefined(context._tabIndex), __chunk_2.classMap(context.classes.main), context._onfocusin, context._onfocusout, context._onkeydown, __chunk_2.ifDefined(context.groupHeaderText), __chunk_2.ifDefined(context._id));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var groupheaderListItemCss = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:0;top:0}:host{background:var(--ui5-group-header-listitem-background-color);border-bottom:1px solid var(--sapList_TableGroupHeaderBorderColor);color:var(--sapList_TableGroupHeaderTextColor)}.ui5-li-root.ui5-ghli-root{padding-top:1rem;color:currentColor;font-size:var(--sapMFontHeader6Size);font-weight:400;line-height:2rem}.ui5-ghli-title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-li-groupheader",
	  languageAware: true,
	  properties:
	  /** @lends  sap.ui.webcomponents.main.GroupHeaderListItem.prototype */
	  {},
	  slots:
	  /** @lends sap.ui.webcomponents.main.GroupHeaderListItem.prototype */
	  {
	    /**
	     * Defines the text of the <code>ui5-li-groupheader</code>.
	     * <br>
	     * <b>Note:</b> Аlthough this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
	     *
	     * @type {Node[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      type: Node
	    }
	  },
	  events:
	  /** @lends  sap.ui.webcomponents.main.GroupHeaderListItem.prototype */
	  {}
	};
	/**
	 * @class
	 * The <code>ui5-li-group-header</code> is a special list item, used only to separate other list items into logical groups.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.GroupHeaderListItem
	 * @extends ListItemBase
	 * @tagname ui5-li-groupheader
	 * @public
	 */

	var GroupHeaderListItem =
	/*#__PURE__*/
	function (_ListItemBase) {
	  __chunk_1._inherits(GroupHeaderListItem, _ListItemBase);

	  __chunk_1._createClass(GroupHeaderListItem, null, [{
	    key: "template",
	    get: function get() {
	      return main;
	    }
	  }, {
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return [__chunk_20.ListItemBase.styles, groupheaderListItemCss];
	    }
	  }]);

	  function GroupHeaderListItem() {
	    var _this;

	    __chunk_1._classCallCheck(this, GroupHeaderListItem);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(GroupHeaderListItem).call(this));
	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    return _this;
	  }

	  __chunk_1._createClass(GroupHeaderListItem, [{
	    key: "group",
	    get: function get() {
	      return true;
	    }
	  }, {
	    key: "groupHeaderText",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.GROUP_HEADER_TEXT);
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
	                return Promise.all([__chunk_1.fetchI18nBundle("@ui5/webcomponents")]);

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
	  }]);

	  return GroupHeaderListItem;
	}(__chunk_20.ListItemBase);

	GroupHeaderListItem.define();

	exports.GroupHeaderListItem = GroupHeaderListItem;

});
//# sourceMappingURL=chunk-3ec67c16.js.map
