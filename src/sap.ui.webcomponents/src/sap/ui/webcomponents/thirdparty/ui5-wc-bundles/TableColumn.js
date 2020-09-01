sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5'], function (__chunk_1, __chunk_2, __chunk_6, __chunk_7) { 'use strict';

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<th scope=\"col\" part=\"column\"><slot></slot></th>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject());
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var styles = ":host{display:contents}th{background:var(--sapList_HeaderBackground);border:none;border-bottom:1px solid var(--sapList_BorderColor);width:inherit;font-weight:400;padding:.25rem;box-sizing:border-box;height:3rem;text-align:left;vertical-align:middle}:host([first]) th{padding-left:1rem}:host([sticky]) th{position:sticky;top:0;z-index:99}";

	var metadata = {
	  tag: "ui5-table-column",
	  slots:
	  /** @lends sap.ui.webcomponents.main.TableColumn.prototype */
	  {
	    /**
	     * Defines the content of the column header.
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
	  /** @lends sap.ui.webcomponents.main.TableColumn.prototype */
	  {
	    /**
	     * Defines the minimum table width required to display this column. By default it is always displayed.
	     * <br><br>
	     * The responsive behavior of the <code>ui5-table</code> is determined by this property. As an example, by setting
	     * <code>minWidth</code> property to <code>40em</code> shows this column on tablet (and desktop) but hides it on mobile.
	     * <br>
	     * For further responsive design options, see <code>demandPopin</code> property.
	     *
	     * @type {number}
	     * @defaultvalue Infinity
	     * @public
	     */
	    minWidth: {
	      type: __chunk_1.Integer,
	      defaultValue: Infinity
	    },

	    /**
	     * The text for the column when it pops in.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    popinText: {
	      type: String
	    },

	    /**
	     * According to your <code>minWidth</code> settings, the <code>ui5-table-column</code> can be hidden
	     * in different screen sizes.
	     * <br><br>
	     * Setting this property to <code>true</code>, shows this column as pop-in instead of hiding it.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    demandPopin: {
	      type: Boolean
	    },

	    /**
	     * @private
	     */
	    first: {
	      type: Boolean
	    },

	    /**
	     * @private
	     */
	    last: {
	      type: Boolean
	    },

	    /**
	     * @private
	     */
	    sticky: {
	      type: Boolean
	    }
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-table-column</code> component allows to define column specific properties that are applied
	 * when rendering the <code>ui5-table</code> component.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.TableColumn
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-table-column
	 * @public
	 */

	var TableColumn =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(TableColumn, _UI5Element);

	  function TableColumn() {
	    __chunk_1._classCallCheck(this, TableColumn);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(TableColumn).apply(this, arguments));
	  }

	  __chunk_1._createClass(TableColumn, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return styles;
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
	  }]);

	  return TableColumn;
	}(__chunk_1.UI5Element);

	TableColumn.define();

	return TableColumn;

});
//# sourceMappingURL=TableColumn.js.map
