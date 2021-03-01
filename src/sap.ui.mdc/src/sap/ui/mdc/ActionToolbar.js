/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/m/OverflowToolbar", "sap/m/OverflowToolbarRenderer", "sap/m/ToolbarSpacer", "sap/m/ToolbarSeparator"
], function(OverflowToolbar, OverflowToolbarRenderer, ToolbarSpacer, ToolbarSeparator) {
	"use strict";

	/**
	 * Constructor for a new ActionToolbar.<br>
	 * <b>Note:</b><br>
	 * The control is experimental and the API / behavior is not finalized. It should only be used internally in other mdc controls (e.g.
	 * chart/table).<br>
	 * The content aggregation of the control must not be used.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The column for the metadata driven table, that hold the template to be shown when the rows has data.
	 * @extends sap.m.OverflowToolbar
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @experimental
	 * @since 1.58
	 * @alias sap.ui.mdc.ActionToolbar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var ActionToolbar = OverflowToolbar.extend("sap.ui.mdc.ActionToolbar", {
		metadata: {
			library: "sap.ui.mdc",
			defaultAggregation: "actions",
			properties: {
				/**
				 * Determines whether the toolbar is used as header (e.g. for a table).
				 */
				useAsHeader: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				}
			},
			aggregations: {
				/**
				 * Content shown at the begin of the toolbar (e.g. Title).
				 */
				begin: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Content shown between the title and actions on the toolbar.
				 */
				between: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Further actions in the toolbar.
				 */
				actions: {
					type: "sap.ui.core.Control",
					multiple: true
				},

				/**
				 * Content at the end of the toolbar.
				 */
				end: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		},
		renderer: OverflowToolbarRenderer
	});

	var _aAggregations = [
		"begin", "between", "actions", "end"
	];

	function _getAggregationIndex(oToolbar, sAggregationName) {
		var iAggIdx = _aAggregations.indexOf(sAggregationName);
		if (iAggIdx >= 0 && oToolbar._oSpacer /* Only return an index if the toolbar is not yet destroyed */) {
			return iAggIdx;
		}
		return -1;
	}

	function _add(oToolbar, oObj) {
		oToolbar._editctx = true;
		var res = oToolbar.addContent(oObj);
		oToolbar._editctx = false;
		return res;
	}

	function _insert(oToolbar, oObj, iIndex) {
		oToolbar._editctx = true;
		var res = oToolbar.insertContent(oObj, iIndex);
		oToolbar._editctx = false;
		return res;
	}

	function _remove(oToolbar, oObj) {
		oToolbar._editctx = true;
		var res = oToolbar.removeContent(oObj);
		oToolbar._editctx = false;
		return res;
	}

	function _destroy(oToolbar) {
		oToolbar._editctx = true;
		var res = oToolbar.destroyContent();
		oToolbar._editctx = false;
		return res;
	}

	function _checkModifyContent(oToolbar, sAggregationName) {
		if (sAggregationName === "content" && !oToolbar._editctx) {
			throw new Error("Mutator functions of the content aggregation of the ActionToolbar '" + oToolbar.getId() + "' must not be used.");
		}
	}

	ActionToolbar.prototype.init = function() {
		// Separator between begin (title) and between (variant) content of the toolbar.
		this._oTitleSeparator = new ToolbarSeparator({
			visible: false
		});
		// Spacer added to right align actions and end aggregation of the toolbar.
		this._oSpacer = new ToolbarSpacer();
		// Separator between actions and end content of the toolbar.
		this._oActionSeparator = new ToolbarSeparator({
			visible: false
		});

		if (OverflowToolbar.prototype.init) {
			OverflowToolbar.prototype.init.apply(this, arguments);
		}
		// Add TitleSeparator, Spacer and ActionSeparator(not yet used) to the content of the toolbar (ordered)
		_add(this, this._oTitleSeparator);
		_add(this, this._oSpacer);
		_add(this, this._oActionSeparator);

		this.setUseAsHeader(true);
	};

	ActionToolbar.prototype.exit = function() {
		this._oSpacer = null;
		this._oTitleSeparator = null;
		this._oActionSeparator = null;
		_destroy(this);

		if (OverflowToolbar.prototype.exit) {
			OverflowToolbar.prototype.exit.apply(this, arguments);
		}
	};

	ActionToolbar.prototype._getState = function(sAggregationName) {
		var iAggIdx = _getAggregationIndex(this, sAggregationName);
		if (iAggIdx >= 0) {
			return {
				aggIdx: iAggIdx,
				sepIdcs: [
					this.indexOfContent(this._oTitleSeparator), this.indexOfContent(this._oSpacer), this.indexOfContent(this._oActionSeparator)
				]
			};
		}
		return null;
	};

	// According to visual designs currently no separator between actions and end content, only title separator is handled below
	/* Begin Title Separator handling */
	ActionToolbar.prototype.onAfterRendering = function() {
		OverflowToolbar.prototype.onAfterRendering.apply(this, arguments);
		this._updateSeparator();
	};

	ActionToolbar.prototype._onContentPropertyChangedOverflowToolbar = function(oEvent) {
		if (this._bIsBeingDestroyed) {
			return;
		}
		OverflowToolbar.prototype._onContentPropertyChangedOverflowToolbar.apply(this, arguments);
		if (oEvent.getParameter("name") === "visible" || oEvent.getParameter("name") === "width" && oEvent.getSource() != this._oTitleSeparator) {
			this._updateSeparator();
		}
	};

	ActionToolbar.prototype._updateSeparator = function() {
		if (this._oTitleSeparator && !this._editctx) {
			var fHasVisible = function(aArray) {
				return aArray ? aArray.some(function(oCtr) {
					// visible="true" and does not have "0px" width
					var bHasWidth = oCtr.getWidth ? oCtr.getWidth() !== "0px" : true;
					return oCtr.getVisible() && bHasWidth;
				}) : false;
			};
			var bHasBegin = fHasVisible(this.getBegin());
			var bHasBetween = fHasVisible(this.getBetween());
			this._oTitleSeparator.setVisible(bHasBegin && bHasBetween);
		}
	};
	/* End Separator handling */

	ActionToolbar.prototype.setUseAsHeader = function(bHeader) {
		this.setProperty("useAsHeader", bHeader, true);
		this.toggleStyleClass("sapMTBHeader-CTX", !!bHeader);
		return this;
	};

	ActionToolbar.prototype.indexOfAggregation = function(sAggregationName, oObject) {
		var oInfo = this._getState(sAggregationName);
		if (oInfo) {
			var iIdx = this.indexOfContent(oObject);
			if (iIdx < 0) {
				return -1;
			}
			var iPrevSepIdx = oInfo.aggIdx == 0 ? -1 : oInfo.sepIdcs[oInfo.aggIdx - 1];
			var iNextSepIdx = oInfo.aggIdx == 3 ? this.getContent().length : oInfo.sepIdcs[oInfo.aggIdx];
			if (iIdx < iPrevSepIdx || iIdx > iNextSepIdx) {
				return -1;
			}
			return iIdx - iPrevSepIdx - 1;
		}
		return OverflowToolbar.prototype.indexOfAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.getAggregation = function(sAggregationName) {
		var oInfo = this._getState(sAggregationName);
		if (oInfo) {
			var aContent = this.getContent();
			return aContent.slice(oInfo.aggIdx === 0 ? 0 : (oInfo.sepIdcs[oInfo.aggIdx - 1] + 1), oInfo.aggIdx >= oInfo.sepIdcs.length ? aContent.length : oInfo.sepIdcs[oInfo.aggIdx]);
		}
		return OverflowToolbar.prototype.getAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.addAggregation = function(sAggregationName, oObject) {
		var oInfo = this._getState(sAggregationName);
		if (oInfo) {
			if (!oObject) {
				return this;
			}
			var iIdx = this.indexOfContent(oObject);
			if (iIdx >= 0) {
				_remove(this, oObject);
				this.addAggregation(sAggregationName, oObject);
			} else {
				_insert(this, oObject, oInfo.aggIdx >= oInfo.sepIdcs.length ? this.getContent().length : oInfo.sepIdcs[oInfo.aggIdx]);
			}
			this._updateSeparator();
			return this;
		}
		_checkModifyContent(this, sAggregationName);
		return OverflowToolbar.prototype.addAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.insertAggregation = function(sAggregationName, oObject, iIndex) {
		var oInfo = this._getState(sAggregationName);
		if (oInfo) {
			if (!oObject) {
				return this;
			}
			var iIdx = this.indexOfContent(oObject);
			if (iIdx >= 0) {
				iIdx = this.indexOfAggregation(sAggregationName, oObject);
				if (iIdx >= 0 && iIndex > iIdx) {
					iIndex--;
				}
				_remove(this, oObject);
				this.insertAggregation(sAggregationName, oObject, iIndex);
			} else {
				var iLen = this.getAggregation(sAggregationName).length;
				if (iIndex < 0) {
					iIdx = 0;
				} else if (iIndex > iLen) {
					iIdx = iLen;
				} else {
					iIdx = iIndex;
				}
				var iPrevSepIdx = oInfo.aggIdx == 0 ? -1 : oInfo.sepIdcs[oInfo.aggIdx - 1];
				_insert(this, oObject, iIdx + iPrevSepIdx + 1);
			}
			this._updateSeparator();
			return this;
		}
		_checkModifyContent(this, sAggregationName);
		return OverflowToolbar.prototype.insertAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.removeAggregation = function(sAggregationName, vObject) {
		if (_getAggregationIndex(this, sAggregationName) >= 0) {
			var oRemoved = _remove(this, vObject);
			this._updateSeparator();
			return oRemoved;
		}
		_checkModifyContent(this, sAggregationName);
		return OverflowToolbar.prototype.removeAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.removeAllAggregation = function(sAggregationName) {
		if (_getAggregationIndex(this, sAggregationName) >= 0) {
			var aContentToRemove = this.getAggregation(sAggregationName);
			for (var i = 0; i < aContentToRemove.length; i++) {
				this.removeAggregation(sAggregationName, aContentToRemove[i]);
			}
			this._updateSeparator();
			return aContentToRemove;
		}
		_checkModifyContent(this, sAggregationName);
		return OverflowToolbar.prototype.removeAllAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.destroyAggregation = function(sAggregationName) {
		if (_getAggregationIndex(this, sAggregationName) >= 0) {
			var aContentToDelete = this.removeAllAggregation(sAggregationName);
			for (var i = 0; i < aContentToDelete.length; i++) {
				aContentToDelete[i].destroy();
			}
			this._updateSeparator();
			return this;
		}
		_checkModifyContent(this, sAggregationName);
		return OverflowToolbar.prototype.destroyAggregation.apply(this, arguments);
	};

	ActionToolbar.prototype.propagateProperties = function() {
		// TODO: When the toolbar is used with aggregation forwarding (see aggregation actions of MDCTable) the propagation does not happen
		// because the actions are finally stored in the content aggregation and access to mAggregations["actions"] does not have any effect.
		var aContent = this.getContent();
		for (var i = 0; i < aContent.length; i++) {
			if (aContent[i].aAPIParentInfos) {
				aContent[i].__aAPIParentInfos = aContent[i].aAPIParentInfos;
				aContent[i].aAPIParentInfos = null;
			}
		}
		var res = OverflowToolbar.prototype.propagateProperties.apply(this, arguments);
		for (var i = 0; i < aContent.length; i++) {
			if (aContent[i].__aAPIParentInfos) {
				aContent[i].aAPIParentInfos = aContent[i].__aAPIParentInfos;
				aContent[i].__aAPIParentInfos = null;
			}
		}
		return res;
	};

	return ActionToolbar;

}, true);
