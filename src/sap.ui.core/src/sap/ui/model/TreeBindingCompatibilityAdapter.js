/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides class sap.ui.model.odata.TreeBindingAdapter
sap.ui.define(["sap/base/util/each"],
	function(each) {
		"use strict";

		/**
		 * Adapter for TreeBindings to add the ListBinding functionality and use the
		 * tree structure in list based controls.
		 *
		 * This module is only for experimental and internal use!
		 *
		 * @param {sap.ui.model.TreeBinding} oBinding
		 *   The binding to add ListBinding functionality to
		 * @param {object} oControl
		 *   The tree or tree table control using the given binding; the control is used for
		 *   selection handling
		 *
		 * @alias sap.ui.model.TreeBindingCompatibilityAdapter
		 * @class
		 * @protected
		 *
		 * @deprecated since 1.96.0; use {@link sap.ui.model.TreeBindingAdapter} instead
		 */
		var TreeBindingCompatibilityAdapter = function (oBinding, oControl) {
			// Code necessary for ClientTreeBinding
			Object.assign(oBinding, {
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

				_initContexts: function(bSkipFirstLevelLoad) {
					// load the root contexts and create the context info map entry (if missing)
					this.aContexts = this.getRootContexts(0, Number.MAX_VALUE);
					for (var i = 0, l = this.aContexts.length; i < l; i++) {
						var oldContextInfo = this._getContextInfo(this.aContexts[i]);
						this._setContextInfo({
							oContext: this.aContexts[i],
							iLevel: 0,
							bExpanded: oldContextInfo ? oldContextInfo.bExpanded : false
						});
					}

					if (this._bExpandFirstLevel && !this._bFirstLevelExpanded) {
						this._expandFirstLevel(bSkipFirstLevelLoad);
					}
				},

				_expandFirstLevel: function (bSkipFirstLevelLoad) {
					var that = this;
					if (this.aContexts && this.aContexts.length > 0) {
						each(this.aContexts.slice(), function(iIndex, oContext) {
							if (!bSkipFirstLevelLoad) {
								that._loadChildContexts(oContext);
							}
							that._getContextInfo(oContext).bExpanded = true;
						});

						this._bFirstLevelExpanded = true;
					}
				},

				_fnFireFilter: oBinding._fireFilter,
				_fireFilter: function() {
					this._fnFireFilter.apply(this, arguments);
					this._initContexts(true);
					this._restoreContexts(this.aContexts);
				},
				_fnFireChange: oBinding._fireChange,
				_fireChange: function() {
					this._fnFireChange.apply(this, arguments);
					this._initContexts(true);
					this._restoreContexts(this.aContexts);
				},
				_restoreContexts: function(aContexts) {
					var that = this;
					var aNewChildContexts = [];
					each(aContexts.slice(), function(iIndex, oContext) {
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
					var iIndex = (this.aContexts ? this.aContexts.indexOf(oContext) : -1);
					var aNodeContexts = this.getNodeContexts(oContext, 0, Number.MAX_VALUE);
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
				getNodes: function(iStartIndex, iLength) {
					var aContexts = this.getContexts(iStartIndex, iStartIndex + iLength);
					//wrap contexts into node objects
					var aNodes = [];
					for (var i = 0; i < aContexts.length; i++) {
						var oContextInfo = this._getContextInfo(aContexts[i]) || {}; //empty object to make sure this does not break
						var oContext = aContexts[i];
						aNodes.push({
							context: oContext,
							level: oContextInfo.iLevel,
							parent: oContextInfo.oParentContext,
							nodeState: {
								expanded: oContextInfo.bExpanded,
								collapsed: !oContextInfo.bExpanded,
								selected: false //default should be false, correct value is given via the selection model
							}
						});
					}
					return aNodes;
				},
				hasChildren: function() {
					return true;
				},
				nodeHasChildren: function() {
					return true;
				},
				getContextByIndex: function (iRowIndex) {
					return this.aContexts[iRowIndex];
				},
				getLevel: function(oContext) {
					var oContextInfo = this._getContextInfo(oContext);
					return oContextInfo ? oContextInfo.iLevel : -1;
				},
				isExpanded: function(iRowIndex) {
					var oContext = this.getContextByIndex(iRowIndex);
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
				expand: function (iRowIndex) {
					this.expandContext(this.getContextByIndex(iRowIndex));
				},
				collapseContext: function(oContext, bSupressChanges) {
					var oContextInfo = this._getContextInfo(oContext);
					if (oContextInfo && oContextInfo.bExpanded) {
						this.storeSelection();
						for (var i = this.aContexts.length - 1; i > 0; i--) {
							if (this._getContextInfo(this.aContexts[i]).oParentContext === oContext) {
								this.aContexts.splice(i, 1);
							}
						}
						oContextInfo.bExpanded = false;
						if (!bSupressChanges) {
							this._fireChange();
						}
						this.restoreSelection();
					}
				},
				collapse: function (iRowIndex) {
					this.collapseContext(this.getContextByIndex(iRowIndex));
				},
				collapseToLevel: function (iLevel) {
					if (!iLevel || iLevel < 0) {
						iLevel = 0;
					}

					var aContextsCopy = this.aContexts.slice();
					for (var i = aContextsCopy.length - 1; i >= 0; i--) {
						var iContextLevel = this.getLevel(aContextsCopy[i]);
						if (iContextLevel != -1 && iContextLevel >= iLevel) {
							this.collapseContext(aContextsCopy[i], true);
						}
					}

					this._fireChange();
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
				toggleIndex: function (iRowIndex) {
					this.toggleContext(this.getContextByIndex(iRowIndex));
				},
				storeSelection: function() {
					var aSelectedIndices = oControl.getSelectedIndices();
					var aSelectedContexts = [];
					each(aSelectedIndices, function(iIndex, iValue) {
						aSelectedContexts.push(oControl.getContextByIndex(iValue));
					});
					this._aSelectedContexts = aSelectedContexts;
				},
				restoreSelection: function() {
					oControl.clearSelection();
					var _aSelectedContexts = this._aSelectedContexts;
					each(this.aContexts, function(iIndex, oContext) {
						if (((_aSelectedContexts ? _aSelectedContexts.indexOf(oContext) : -1)) >= 0) {
							oControl.addSelectionInterval(iIndex, iIndex);
						}
					});
					this._aSelectedContexts = undefined;
				},
				attachSelectionChanged: function() {
					// for compatibility reasons (OData Tree Binding)
					return undefined;
				},
				detachSelectionChanged: function() {}, // for compatibility
				clearSelection: function () {
					oControl._oSelection.clearSelection();
				},
				attachSort: function() {},
				detachSort: function() {}
			});
			// initialize the binding
			oBinding._init(oControl.getExpandFirstLevel());

		};

		return TreeBindingCompatibilityAdapter;
	}, true);