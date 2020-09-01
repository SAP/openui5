sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5'], function (__chunk_1, __chunk_2, __chunk_6, __chunk_7) { 'use strict';

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<td tabindex=\"-1\" part=\"cell\"><slot></slot></td>"]);

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
	var styles = ":host{display:contents;font-family:var(--sapFontFamily);font-size:.875rem;height:100%;box-sizing:border-box;overflow:hidden;color:var(--sapContent_LabelColor)}td{padding:.5rem .25rem;box-sizing:border-box;word-break:break-word}.ui5-table-popin-row td,:host([first-in-row]) td{padding-left:1rem}:host([first-in-row]) td{padding-left:1rem}:host([popined]) td{padding-left:0}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-table-cell",
	  slots:
	  /** @lends sap.ui.webcomponents.main.TableCell.prototype */
	  {
	    /**
	     * Specifies the content of the <code>ui5-table-cell</code>.
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
	  /** @lends sap.ui.webcomponents.main.TableCell.prototype */
	  {
	    /**
	     * @private
	     */
	    firstInRow: {
	      type: Boolean
	    },

	    /**
	     * @private
	     */
	    lastInRow: {
	      type: Boolean
	    },

	    /**
	     * @private
	     */
	    popined: {
	      type: Boolean
	    }
	  },
	  events:
	  /** @lends sap.ui.webcomponents.main.TableCell.prototype */
	  {}
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-table-cell</code> component defines the structure of the data in a single <code>ui5-table</code> cell.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.TableCell
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-table-cell
	 * @public
	 */

	var TableCell =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(TableCell, _UI5Element);

	  function TableCell() {
	    __chunk_1._classCallCheck(this, TableCell);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(TableCell).apply(this, arguments));
	  }

	  __chunk_1._createClass(TableCell, null, [{
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

	  return TableCell;
	}(__chunk_1.UI5Element);

	TableCell.define();

	return TableCell;

});
//# sourceMappingURL=TableCell.js.map
