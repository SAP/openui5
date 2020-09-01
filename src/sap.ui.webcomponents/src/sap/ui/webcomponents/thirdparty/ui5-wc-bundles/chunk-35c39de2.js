sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-124ca1de'], function (exports, __chunk_1, __chunk_2, __chunk_6, __chunk_7, __chunk_8, __chunk_19) { 'use strict';

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var styles = ":host(:not([hidden])){display:block}:host{height:var(--_ui5_list_item_base_height);background:var(--ui5-listitem-background-color);box-sizing:border-box;border-bottom:1px solid transparent}:host([selected]){background:var(--sapList_SelectionBackgroundColor)}:host([has-border]){border-bottom:var(--ui5-listitem-border-bottom)}:host([selected]){border-bottom:var(--ui5-listitem-selected-border-bottom)}:host([selected][has-border]){border-bottom:var(--ui5-listitem-selected-border-bottom)}.ui5-li-root{position:relative;display:flex;align-items:center;width:100%;height:100%;padding:0 1rem 0 1rem;box-sizing:border-box}:host([focused]) .ui5-li-root.ui5-li--focusable{outline:none}:host([focused]) .ui5-li-root.ui5-li--focusable:after{content:\"\";border:var(--_ui5_listitembase_focus_width) dotted var(--sapContent_FocusColor);position:absolute;top:0;right:0;bottom:0;left:0;pointer-events:none}:host([focused]) .ui5-li-content:focus:after{content:\"\";border:var(--_ui5_listitembase_focus_width) dotted var(--sapContent_FocusColor);position:absolute;top:0;right:0;bottom:0;left:0;pointer-events:none}:host([active][focused]) .ui5-li-root.ui5-li--focusable:after{border-color:var(--sapContent_ContrastFocusColor)}.ui5-li-content{max-width:100%;min-height:1px;font-family:var(--sapFontFamily);pointer-events:none}";

	/**
	 * @public
	 */

	var metadata = {
	  properties:
	  /** @lends  sap.ui.webcomponents.main.ListItemBase.prototype */
	  {
	    /**
	     * Defines the selected state of the <code>ListItem</code>.
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    selected: {
	      type: Boolean
	    },

	    /**
	    * Defines if the list item should display its bottom border.
	    * @private
	    */
	    hasBorder: {
	      type: Boolean
	    },
	    _tabIndex: {
	      type: String,
	      defaultValue: "-1",
	      noAttribute: true
	    },

	    /**
	     * Indicates if the element is on focus
	     * @private
	     */
	    focused: {
	      type: Boolean
	    }
	  },
	  events: {
	    _focused: {},
	    "_forward-after": {},
	    "_forward-before": {}
	  }
	};
	/**
	 * A class to serve as a foundation
	 * for the <code>ListItem</code> and <code>GroupHeaderListItem</code> classes.
	 *
	 * @abstract
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.ListItemBase
	 * @extends UI5Element
	 * @public
	 */

	var ListItemBase =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(ListItemBase, _UI5Element);

	  function ListItemBase() {
	    __chunk_1._classCallCheck(this, ListItemBase);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ListItemBase).apply(this, arguments));
	  }

	  __chunk_1._createClass(ListItemBase, [{
	    key: "_onfocusin",
	    value: function _onfocusin(event) {
	      if (event.isMarked === "button" || event.isMarked === "link") {
	        return;
	      }

	      this.focused = true;
	      this.fireEvent("_focused", event);
	    }
	  }, {
	    key: "_onfocusout",
	    value: function _onfocusout(_event) {
	      this.focused = false;
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isTabNext(event)) {
	        return this._handleTabNext(event);
	      }

	      if (__chunk_8.isTabPrevious(event)) {
	        return this._handleTabPrevious(event);
	      }
	    }
	  }, {
	    key: "_onkeyup",
	    value: function _onkeyup() {}
	  }, {
	    key: "_handleTabNext",
	    value: function _handleTabNext(event) {
	      var target = event.target;

	      if (this.shouldForwardTabAfter(target)) {
	        this.fireEvent("_forward-after", {
	          item: target
	        });
	      }
	    }
	  }, {
	    key: "_handleTabPrevious",
	    value: function _handleTabPrevious(event) {
	      var target = event.target;

	      if (this.shouldForwardTabBefore(target)) {
	        var eventData = event;
	        eventData.item = target;
	        this.fireEvent("_forward-before", eventData);
	      }
	    }
	    /*
	    * Determines if th current list item either has no tabbable content or
	    * [TAB] is performed onto the last tabbale content item.
	    */

	  }, {
	    key: "shouldForwardTabAfter",
	    value: function shouldForwardTabAfter(target) {
	      var aContent = __chunk_19.getTabbableElements(this.getDomRef());

	      if (target.getFocusDomRef) {
	        target = target.getFocusDomRef();
	      }

	      return !aContent.length || aContent[aContent.length - 1] === target;
	    }
	    /*
	    * Determines if the current list item is target of [SHIFT+TAB].
	    */

	  }, {
	    key: "shouldForwardTabBefore",
	    value: function shouldForwardTabBefore(target) {
	      return this.getDomRef() === target;
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      return {
	        main: {
	          "ui5-li-root": true,
	          "ui5-li--focusable": true
	        }
	      };
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
	      return styles;
	    }
	  }]);

	  return ListItemBase;
	}(__chunk_1.UI5Element);

	exports.ListItemBase = ListItemBase;

});
//# sourceMappingURL=chunk-35c39de2.js.map
