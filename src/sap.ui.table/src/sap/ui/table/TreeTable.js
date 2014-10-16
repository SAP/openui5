/*!
 * ${copyright}
 */

// Provides control sap.ui.table.TreeTable.
sap.ui.define(['jquery.sap.global', './Table', './library'],
	function(jQuery, Table, library) {
	"use strict";


	
	/**
	 * Constructor for a new TreeTable.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The TreeTable Control.
	 * @extends sap.ui.table.Table
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.table.TreeTable
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TreeTable = Table.extend("sap.ui.table.TreeTable", /** @lends sap.ui.table.TreeTable.prototype */ { metadata : {
	
		library : "sap.ui.table",
		properties : {
	
			/**
			 * Flag to enable or disable expanding of first level.
			 */
			expandFirstLevel : {type : "boolean", defaultValue : false},
	
			/**
			 * If group mode is enable nodes with subitems are rendered as if they were group headers. This can be used to do the grouping for an OData service on the backend and visualize this in a table. This mode only makes sense if the tree has a depth of exacly 1 (group headers and entries)
			 */
			useGroupMode : {type : "boolean", group : "Appearance", defaultValue : false},
	
			/**
			 * The property name of the rows data which will be displayed as a group header if the group mode is enabled
			 */
			groupHeaderProperty : {type : "string", group : "Data", defaultValue : null}
		},
		events : {
	
			/**
			 * fired when a node has been expanded or collapsed (only available in hierachical mode)
			 */
			toggleOpenState : {
				parameters : {
	
					/**
					 * index of the expanded/collapsed row
					 */
					rowIndex : {type : "int"}, 
	
					/**
					 * binding context of the selected row
					 */
					rowContext : {type : "object"}, 
	
					/**
					 * flag whether the node has been expanded or collapsed
					 */
					expanded : {type : "boolean"}
				}
			}
		}
	}});
	
	
	/**
	 * expands the row for the given row index
	 *
	 * @name sap.ui.table.TreeTable#expand
	 * @function
	 * @param {int} iRowIndex
	 *         index of the row to expand
	 * @type sap.ui.table.TreeTable
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * collapses the row for the given row index
	 *
	 * @name sap.ui.table.TreeTable#collapse
	 * @function
	 * @param {int} iRowIndex
	 *         index of the row to collapse
	 * @type sap.ui.table.TreeTable
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * returns whether the row is expanded or collapsed
	 *
	 * @name sap.ui.table.TreeTable#isExpanded
	 * @function
	 * @param {int} iRowIndex
	 *         index of the row to check
	 * @type boolean
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	/**
	 * Initialization of the TreeTable control
	 * @private
	 */
	TreeTable.prototype.init = function() {
		Table.prototype.init.apply(this, arguments);
		this._iLastFixedColIndex = 0;
		
		// adopting properties and load icon fonts for bluecrystal
		if (sap.ui.getCore().getConfiguration().getTheme() === "sap_bluecrystal") {
		
			// add the icon fonts
			jQuery.sap.require("sap.ui.core.IconPool");
			sap.ui.core.IconPool.insertFontFaceStyle();
			
			// defaulting the rowHeight
			// this.setRowHeight(32); --> is done via CSS
			
		}
		
	};
	
	
	/**
	 * Setter for property <code>fixedRowCount</code>.
	 *
	 * <b>This property is not supportd for the TreeTable and will be ignored!</b>
	 *
	 * Default value is <code>0</code> 
	 *
	 * @param {int} iFixedRowCount  new value for property <code>fixedRowCount</code>
	 * @return {sap.ui.table.TreeTable} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.table.TreeTable#setFixedRowCount
	 * @function
	 */
	TreeTable.prototype.setFixedRowCount = function(iRowCount) {
		// this property makes no sense for the TreeTable
		jQuery.sap.log.warning("TreeTable: the property \"fixedRowCount\" is not supported and will be ignored!");
		return this;
	};
	
	
	/**
	 * Rerendering handling
	 * @private
	 */
	TreeTable.prototype.onAfterRendering = function() {
		Table.prototype.onAfterRendering.apply(this, arguments);
		this.$().find("[role=grid]").attr("role", "treegrid");
	};
	
	TreeTable.prototype.isTreeBinding = function(sName) {
		sName = sName || "rows";
		if (sName === "rows") {
			return true;
		}
		return sap.ui.core.Element.prototype.isTreeBinding.apply(this, sName);
	};
	
	TreeTable.prototype.getBinding = function(sName) {
		sName = sName || "rows";
		var oBinding = sap.ui.core.Element.prototype.getBinding.call(this, sName);
		// the check for the tree binding is only relevant becuase of the DataTable migration
		//  --> once the DataTable is deleted after the deprecation period this check can be deleted 
		if (oBinding && this.isTreeBinding(sName) && sName === "rows" && !oBinding.getLength) {
			// SIMULATE A LIST BINDING FOR THE TREE BINDING!
			//jQuery.sap.log.info("Enhancing Binding Object - Tree to List Binding");
			var that = this;
			jQuery.extend(oBinding, {
				_init: function(bExpandFirstLevel) {
					this._bExpandFirstLevel = bExpandFirstLevel;
					// load the root contexts and create the context info map
					this.mContextInfo = {};
					this._initContexts();
					// expand the first level if required
					if (bExpandFirstLevel && !this._bFirstLevelExpanded) {
						this._expandFirstLevel();
					}
				},

				_initContexts: function() {
					// load the root contexts and create the context info map entry (if missing)
					this.aContexts = this.getRootContexts();
					for (var i = 0, l = this.aContexts.length; i < l; i++) {
						var oldContextInfo = this._getContextInfo(this.aContexts[i]);
						this._setContextInfo({
							oContext: this.aContexts[i],
							iLevel: 0,
							bExpanded: oldContextInfo ? oldContextInfo.bExpanded : false
						});
					}

					if (this._bExpandFirstLevel && !this._bFirstLevelExpanded) {
						this._expandFirstLevel();
					}
				},

				_expandFirstLevel: function () {
					var that = this;
					if (this.aContexts && this.aContexts.length > 0) {
						jQuery.each(this.aContexts.slice(), function(iIndex, oContext) {
							that._loadChildContexts(oContext);
							that._getContextInfo(oContext).bExpanded = true;
						});

						this._bFirstLevelExpanded = true;
					}
				},

				_fnFireFilter: oBinding._fireFilter,
				_fireFilter: function() {
					this._fnFireFilter.apply(this, arguments);
					this._initContexts();
					this._restoreContexts(this.aContexts);
				},
				_fnFireChange: oBinding._fireChange,
				_fireChange: function() {
					this._fnFireChange.apply(this, arguments);
					this._initContexts();
					this._restoreContexts(this.aContexts);
				},
				_restoreContexts: function(aContexts) {
					var that = this;
					var aNewChildContexts = [];
					jQuery.each(aContexts.slice(), function(iIndex, oContext) {
						var oContextInfo = that._getContextInfo(oContext);
						if (oContextInfo && oContextInfo.bExpanded) {
							aNewChildContexts.push.apply(aNewChildContexts, that._loadChildContexts(oContext));
						}
					});
					if (aNewChildContexts.length > 0) {
						this._restoreContexts(aNewChildContexts);
					}
				},
				_loadChildContexts: function(oContext) {
					var oContextInfo = this._getContextInfo(oContext);
					var iIndex = jQuery.inArray(oContext, this.aContexts);
					var aNodeContexts = this.getNodeContexts(oContext);
					for (var i = 0, l = aNodeContexts.length; i < l; i++) {
						this.aContexts.splice(iIndex + i + 1, 0, aNodeContexts[i]);
						var oldContextInfo = this._getContextInfo(aNodeContexts[i]);
						this._setContextInfo({
							oParentContext: oContext,
							oContext: aNodeContexts[i],
							iLevel: oContextInfo.iLevel + 1,
							bExpanded: oldContextInfo ? oldContextInfo.bExpanded : false
						});
					}
					return aNodeContexts;
				},
				_getContextInfo: function(oContext) {
					return oContext ? this.mContextInfo[oContext.getPath()] : undefined;
				},
				_setContextInfo: function(mData) {
					if (mData && mData.oContext) {
						this.mContextInfo[mData.oContext.getPath()] = mData;
					}
				},
				getLength: function() {
					return this.aContexts ? this.aContexts.length : 0;
				},
				getContexts: function(iStartIndex, iLength) {
					return this.aContexts.slice(iStartIndex, iStartIndex + iLength);
				},
				getLevel: function(oContext) {
					var oContextInfo = this._getContextInfo(oContext);
					return oContextInfo ? oContextInfo.iLevel : -1;
				},
				isExpanded: function(oContext) {
					var oContextInfo = this._getContextInfo(oContext);
					return oContextInfo ? oContextInfo.bExpanded : false;
				},
				expandContext: function(oContext) {
					var oContextInfo = this._getContextInfo(oContext);
					if (oContextInfo && !oContextInfo.bExpanded) {
						this.storeSelection();
						this._loadChildContexts(oContext);
						oContextInfo.bExpanded = true;
						this._fireChange();
						this.restoreSelection();
					}
				},
				collapseContext: function(oContext) {
					var oContextInfo = this._getContextInfo(oContext);
					if (oContextInfo && oContextInfo.bExpanded) {
						this.storeSelection();
						for (var i = this.aContexts.length - 1; i > 0; i--) {
							if (this._getContextInfo(this.aContexts[i]).oParentContext === oContext) {
								this.aContexts.splice(i, 1);
							}
						}
						oContextInfo.bExpanded = false;
						this._fireChange();
						this.restoreSelection();
					}
				},
				toggleContext: function(oContext) {
					var oContextInfo = this._getContextInfo(oContext);
					if (oContextInfo) {
						if (oContextInfo.bExpanded) {
							this.collapseContext(oContext);
						} else {
							this.expandContext(oContext);
						}
					}
				},
				storeSelection: function() {
					var aSelectedIndices = that.getSelectedIndices();
					var aSelectedContexts = [];
					jQuery.each(aSelectedIndices, function(iIndex, iValue) {
						aSelectedContexts.push(that.getContextByIndex(iValue));
					});
					this._aSelectedContexts = aSelectedContexts;
				},
				restoreSelection: function() {
					that.clearSelection();
					var _aSelectedContexts = this._aSelectedContexts;
					jQuery.each(this.aContexts, function(iIndex, oContext) {
						if (jQuery.inArray(oContext, _aSelectedContexts) >= 0) {
							that.addSelectionInterval(iIndex, iIndex);
						}
					});
					this._aSelectedContexts = undefined;
				},
				attachSort: function() {},
				detachSort: function() {}
			});
			// initialize the binding
			oBinding._init(this.getExpandFirstLevel());
		}
		return oBinding;
	};
	
	TreeTable.prototype._updateTableContent = function() {
		Table.prototype._updateTableContent.apply(this, arguments);
	
		if (!this.getUseGroupMode()) {
			return;
		}
		
		//If group mode is enabled nodes which have children are visualized as if they were group header
		var oBinding = this.getBinding("rows"),
			iFirstRow = this.getFirstVisibleRow(),
			iCount = this.getVisibleRowCount();
	
		for (var iRow = 0; iRow < iCount; iRow++) {
			var oContext = this.getContextByIndex(iFirstRow + iRow),
				$row = this.getRows()[iRow].$(),
				$rowHdr = this.$().find("div[data-sap-ui-rowindex='" + $row.attr("data-sap-ui-rowindex") + "']");
	
			if (oBinding.hasChildren && oBinding.hasChildren(oContext)) {
				// modify the rows
				$row.addClass("sapUiTableGroupHeader sapUiTableRowHidden");
				var sClass = oBinding.isExpanded(oContext) ? "sapUiTableGroupIconOpen" : "sapUiTableGroupIconClosed";
				$rowHdr.html("<div class=\"sapUiTableGroupIcon " + sClass + "\" tabindex=\"-1\">" + this.getModel().getProperty(this.getGroupHeaderProperty(), oContext) + "</div>");
				$rowHdr.addClass("sapUiTableGroupHeader").removeAttr("title");
			} else {
				$row.removeClass("sapUiTableGroupHeader");
				if (oContext) {
					$row.removeClass("sapUiTableRowHidden");
				}
				$rowHdr.html("");
				$rowHdr.removeClass("sapUiTableGroupHeader");
			}
		}
	};
	
	TreeTable.prototype._updateTableCell = function(oCell, oContext, oTD) {
	
		var oBinding = this.getBinding("rows");
		
		if (oBinding) {
			var iLevel = oBinding.getLevel ? oBinding.getLevel(oContext) : 0;
			var $row;
			// in case of fixed columns we need to lookup the fixed table 
			// otherwise the expand/collapse/margin will not be set!
			if (this.getFixedColumnCount() > 0) {
				$row = oCell.getParent().$("fixed");
			} else {
				$row = oCell.getParent().$();
			}
			var $TreeIcon = $row.find(".sapUiTableTreeIcon");
			var sTreeIconClass = "sapUiTableTreeIconLeaf";
			if (!this.getUseGroupMode()) {
				$TreeIcon.css("marginLeft", iLevel * 17);
			}
			if (oBinding.hasChildren && oBinding.hasChildren(oContext)) {
				sTreeIconClass = oBinding.isExpanded(oContext) ? "sapUiTableTreeIconNodeOpen" : "sapUiTableTreeIconNodeClosed";
				$row.attr('aria-expanded', oBinding.isExpanded(oContext));
				var sNodeText = oBinding.isExpanded(oContext) ? this._oResBundle.getText("TBL_COLLAPSE") : this._oResBundle.getText("TBL_EXPAND");
				$TreeIcon.attr('title', sNodeText);
			} else {
				$row.attr('aria-expanded', false);
				$TreeIcon.attr('aria-label', this._oResBundle.getText("TBL_LEAF"));
			}
			$TreeIcon.removeClass("sapUiTableTreeIconLeaf sapUiTableTreeIconNodeOpen sapUiTableTreeIconNodeClosed").addClass(sTreeIconClass);
			$row.attr("data-sap-ui-level", iLevel);
			$row.attr('aria-level', iLevel + 1);
		}
		
	};
	
	TreeTable.prototype.onclick = function(oEvent) {
		if (jQuery(oEvent.target).hasClass("sapUiTableGroupIcon")) {
			this._onGroupSelect(oEvent);
		} else if (jQuery(oEvent.target).hasClass("sapUiTableTreeIcon")) {
			this._onNodeSelect(oEvent);
		} else {
			if (Table.prototype.onclick) {
				Table.prototype.onclick.apply(this, arguments);
			}
		}
	};
	
	TreeTable.prototype.onsapselect = function(oEvent) {
		if (jQuery(oEvent.target).hasClass("sapUiTableTreeIcon")) {
			this._onNodeSelect(oEvent);
		} else {
			if (Table.prototype.onsapselect) {
				Table.prototype.onsapselect.apply(this, arguments);
			}
		}
	};
	
	TreeTable.prototype.onkeydown = function(oEvent) {
		Table.prototype.onkeydown.apply(this, arguments);
		var $Target = jQuery(oEvent.target),
			$TargetTD = $Target.closest('td');
		if (oEvent.keyCode == jQuery.sap.KeyCodes.TAB && this._bActionMode && $TargetTD.find('.sapUiTableTreeIcon').length > 0) {
			//If node icon has focus set tab to control else set tab to node icon
			if ($Target.hasClass('sapUiTableTreeIcon')) {
				if (!$Target.hasClass("sapUiTableTreeIconLeaf")) {
					$TargetTD.find(':sapFocusable:not(.sapUiTableTreeIcon)').first().focus();
				}
			} else {
				$TargetTD.find('.sapUiTableTreeIcon:not(.sapUiTableTreeIconLeaf)').focus();
			}
			oEvent.preventDefault();
		}
	};
	
	TreeTable.prototype._onNodeSelect = function(oEvent) {
	
		var $parent = jQuery(oEvent.target).parents("tr");
		if ($parent.length > 0) {
			var iRowIndex = this.getFirstVisibleRow() + parseInt($parent.attr("data-sap-ui-rowindex"), 10);
			var oContext = this.getContextByIndex(iRowIndex);
			this.fireToggleOpenState({
				rowIndex: iRowIndex,
				rowContext: oContext,
				expanded: !this.getBinding().isExpanded(oContext)
			});
			this.getBinding("rows").toggleContext(oContext);
		}
	
		oEvent.preventDefault();
		oEvent.stopPropagation();
	
	};
	
	TreeTable.prototype._onGroupSelect = function(oEvent) {
	
		var $parent = jQuery(oEvent.target).parents("[data-sap-ui-rowindex]");
		if ($parent.length > 0) {
			var iRowIndex = this.getFirstVisibleRow() + parseInt($parent.attr("data-sap-ui-rowindex"), 10);
			var oContext = this.getContextByIndex(iRowIndex);
			if (this.getBinding().isExpanded(oContext)) {
				jQuery(oEvent.target).removeClass("sapUiTableGroupIconOpen").addClass("sapUiTableGroupIconClosed");
			} else {
				jQuery(oEvent.target).removeClass("sapUiTableGroupIconClosed").addClass("sapUiTableGroupIconOpen");
			}
			this.fireToggleOpenState({
				rowIndex: iRowIndex,
				rowContext: oContext,
				expanded: !this.getBinding().isExpanded(oContext)
			});
			this.getBinding("rows").toggleContext(oContext);
		}
	
		oEvent.preventDefault();
		oEvent.stopPropagation();
	
	};
	
	TreeTable.prototype.expand = function(iRowIndex) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			var oContext = this.getContextByIndex(iRowIndex);
			oBinding.expandContext(oContext);
		}
	};
	
	TreeTable.prototype.collapse = function(iRowIndex) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			var oContext = this.getContextByIndex(iRowIndex);
			oBinding.collapseContext(oContext);
		}
	};
	
	TreeTable.prototype.isExpanded = function(iRowIndex) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			var oContext = this.getContextByIndex(iRowIndex);
			return oBinding.isExpanded(oContext);
		}
		return false;
	};
	
	TreeTable.prototype._enterActionMode = function($Tabbable) {
		var $domRef = $Tabbable.eq(0);
		
		Table.prototype._enterActionMode.apply(this, arguments);
		if ($Tabbable.length > 0 && $domRef.hasClass("sapUiTableTreeIcon") && !$domRef.hasClass("sapUiTableTreeIconLeaf")) {
			//Set tabindex to 0 to have make node icon accessible
			$domRef.attr("tabindex", 0).focus();
			//set action mode to true so that _leaveActionMode is called to remove the tabindex again
			this._bActionMode = true;
		}
	};
	
	TreeTable.prototype._leaveActionMode = function(oEvent) {
		Table.prototype._leaveActionMode.apply(this, arguments);
		this.$().find(".sapUiTableTreeIcon").attr("tabindex", -1);
	};
	
	

	return TreeTable;

}, /* bExport= */ true);
