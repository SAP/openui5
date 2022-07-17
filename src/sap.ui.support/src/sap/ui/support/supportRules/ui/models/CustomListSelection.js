/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/deepExtend",
	'sap/ui/base/EventProvider',
	'sap/ui/model/SelectionModel'
], function(deepExtend, EventProvider, SelectionModel) {
	"use strict";

	function _isInstanceOf(oObject, sType) {
		if (!oObject || !sType) {
			return false;
		}
		var oType = sap.ui.require(sType);
		return !!(oType && (oObject instanceof oType));
	}

	var TABLESELECTIONADAPTER = {
		isIndexSelected: function(iRowIndex) {
			return this._isSelectedInModel(iRowIndex);
		},

		setSelectedIndex: function(iRowIndex) {
			//TBD
		},

		getSelectedIndices: function () {
			//TBD
			return [];
		},

		setSelectionInterval: function (iFromIndex, iToIndex) {
			this._doChangeSelection("setSelectionInterval", arguments);
		},

		addSelectionInterval: function (iFromIndex, iToIndex) {
			this._doChangeSelection("addSelectionInterval", arguments);
		},

		removeSelectionInterval: function (iFromIndex, iToIndex) {
			this._doChangeSelection("removeSelectionInterval", arguments);
		},

		selectAll: function () {
			this._doChangeSelection("selectAll", [this._getBinding().getLength() - 1]);
		},

		getSelectedIndex: function () {
			return this._getSelectionModel().getLeadSelectedIndex();
		},

		clearSelection: function () {
			if (this._ignoreClearSelection) {
				this._initializeSelectionModel();
				return;
			}
			//TBD Check with filtered selected data
			this._doChangeSelection("clearSelection", arguments);
		},

		_getSelectedIndicesCount: function () {
			return this._getSelectionModel().getSelectedIndices().length;
		},

		_initializeSelectionModel: function () {
			return this._initializeSelectionModel();
		},

		updateSelectionFromModel: function () {
			return this.updateSelectionFromModel();
		},

		syncParentNodeSelectionWithChildren: function (oRuleSetsModel) {
			return this.syncParentNodeSelectionWithChildren(oRuleSetsModel);
		}
	};

	function doCallOnHelper(sName, oHelper) {
		return function() {
			//Log.warning("Function called on helper: " + sName);
			return TABLESELECTIONADAPTER[sName].apply(oHelper, arguments);
		};
	}

	var Selection = EventProvider.extend("sap.ui.support.supportRules.ui.models.CustomListSelection", {

		constructor: function(oControl, sKey) {
			EventProvider.call(this);

			var that = this;

			this._keys = {};
			this._key = sKey;

			this._control = oControl;

			this._UITable = _isInstanceOf(this._control, "sap/ui/table/Table");
			this._tree = _isInstanceOf(this._control, "sap/ui/table/TreeTable") || _isInstanceOf(this._control, "sap/m/Tree");

			// Hack the table and override all selection related coding
			if (this._UITable) {
				this._aggregation = "rows";

				for (var foo in TABLESELECTIONADAPTER) {
					this._control[foo] = doCallOnHelper(foo, this);
				}

				this._control.__onBindingChange = this._control._onBindingChange;
				this._control._onBindingChange = function(oEvent) {
					that._ignoreClearSelection = true;
					this.__onBindingChange.apply(this, arguments);
					if (oEvent.getParameter("reason") !== 'filter' && oEvent.getParameter("reason") !== 'sort') {
						that._ignoreClearSelection = false;
					}

				};

				this.attachEvent("selectionChange", function(oEvent){
					that._getControl()._onSelectionChanged(oEvent);
				});
			} else {
				this._aggregation = "items";

				this._control.attachSelectionChange(function(oEvent) {
					var oSelectionModel = that._getSelectionModel();
					var aChangedItems = oEvent.getParameter("listItems");
					var aChangedIndices = [];
					for (var i = 0; i < aChangedItems.length; i++) {
						var bSelected = aChangedItems[i].getSelected();
						var idx = oControl.indexOfItem(aChangedItems[i]);
						aChangedIndices.push(idx);
						if (bSelected) {
							oSelectionModel.addSelectionInterval(idx, idx);
						} else {
							oSelectionModel.removeSelectionInterval(idx, idx);
						}
					}
					var oEvent = that.oEventPool.borrowObject("selectionChanged", that, {rowIndices: aChangedIndices});
					that._updateModelAfterSelectionChange(oEvent);
					that.oEventPool.returnObject(oEvent);
					that._initializeSelectionModel();
				});

				this._control.attachUpdateFinished(function(){
					that._getSelectionModel(true); // Reinitialize
				});

				this._doAfterInitSelectionModel = function() {
					var aItems = this._getControl().getItems();
					for (var i = 0; i < aItems.length; i++) {
						aItems[i].setSelected(this._isSelectedInModel(i), true);
					}
				};
			}

			if (this._isTree()) {
				oControl.attachToggleOpenState(function(){
					that._getSelectionModel(true); // Reinitialize
				});
			}
		},

		attachRowSelectionChange: function(fHandler) {
			this.attachEvent("selectionChange", fHandler);
		},

		getSelectedKeys: function() {
			var aKeys = [];
			for (var sKey in this._keys) {
				if (this._keys[sKey]){
					aKeys.push(sKey);
				}
			}
			return aKeys;
		},

		// Protected (for subclass)

		_getControl: function() {
			return this._control;
		},

		_isUITable: function() {
			return this._UITable;
		},

		_isTree: function() {
			return this._tree;
		},

		_getBinding: function() {
			return this._getControl().getBinding(this._aggregation);
		},

		_getContextByIndex: function(iRowIndex) {
			return this._getBinding().getContexts(iRowIndex, 1, undefined, true)[0];
		},

		_getSelectionModel: function(bForceInit) {
			if (!this.selectionmodel || bForceInit) {
				this._initializeSelectionModel();
			}
			return this.selectionmodel;
		},

		_getSelectedIndicesFromModel: function() {
			var oBinding = this._getBinding();
			var aIndices = [];
			if (oBinding) {
				var oModel = oBinding.getModel();
				var iLength = oBinding.getLength();
				for (var i = 0; i < iLength; i++) {
					var oContext = this._getContextByIndex(i);
					if (!oContext) {
						return aIndices; //TBD Just a hack to not load everything
					}
					if (this._checkSelectionForContext(oModel, oContext)) {
						aIndices.push(i);
					}
				}
			}
			return aIndices;
		},

		_updateModelAfterSelectionChange: function(oEvent) {
			// needs to be implemented in subclass and in the end _finalizeSelectionUpdate must be called
		},

		updateSelectionFromModel: function() {
			var oBinding = this._getBinding();
			var oModel = oBinding.getModel();
			var oData = oModel.getData();
			var aAllIndices = this._getAllIndicesInModel();
			var that = this;

			function setSelection(sPath, bSelected, bSkipUpdateParent) {
				var aNodes = oModel.getProperty(sPath + "/nodes");

				if (that._isTree() && that._dependent) {
					if (aNodes && aNodes.length) {
						for (var j = 0; j < aNodes.length; j++) {
							var aPath = sPath.split("");
							setSelection(sPath + "/nodes/" + j + "", oModel.getData()[aPath[1]].nodes[j].selected, true);
						}
					} else { // leaf
						var aPath = sPath.split("/");
						that.bTempSelected = true;
							aPath.pop();
							aPath.pop();
							var sParentPath = aPath.join("/"),
								sTempPhat = sParentPath.split("/");
							//If last note of parent is selected the recursion will select the parent also
							if (oData[sTempPhat[1]]) {
								that.bTempSelected = oData[sTempPhat[1]].selected;
							}

							that._setSelectionForContext(oModel, oModel.createBindingContext(sParentPath), that.bTempSelected);
							// TBD recursion + select parent when all children are selected

					}
				}

				that._setSelectionForContext(oModel, oModel.createBindingContext(sPath), bSelected);
			}

			for (var i = 0; i < aAllIndices.length; i++) {
				var oContext = this._getContextByIndex(aAllIndices[i]),
					sPath = oContext.getPath(),
					aPath = sPath.split("/"),
					bSelected = true;
				if (aPath[2]) {
					if (oData[aPath[1]].nodes[aPath[3]]) {
						bSelected = oData[aPath[1]].nodes[aPath[3]].selected;
					}
				} else {
						bSelected = oData[aPath[1]].selected;
				}
				setSelection(sPath, bSelected);
			}

			this._finalizeSelectionUpdate();
		},

		_getAllIndicesInModel: function() {
			var oBinding = this._getBinding();
			var aIndices = [];
			if (oBinding) {
				var iLength = oBinding.getLength();
				for (var i = 0; i < iLength; i++) {
						aIndices.push(i);
				}
			}
			return aIndices;
		},

		_isSelectedInModel: function(iRowIndex) {
			var oBinding = this._getBinding();
			var iLength = oBinding ? oBinding.getLength() : 0;
			if (!oBinding || iRowIndex >= iLength) {
				return false;
			}
			return this._checkSelectionForContext(oBinding.getModel(), this._getContextByIndex(iRowIndex));
		},

		_finalizeSelectionUpdate: function() {
			this._initializeSelectionModel();
			this._getSelectionModel();
			this._fireRowSelectionChange();
		},

		_checkSelectionForContext: function(oModel, oContext) {
			var sKey;
			if (this._key === "$PATH") {
				sKey = oContext.getPath();
			} else {
				sKey = oModel.getProperty(this._key, oContext);
			} // Or maybe even stored in the model ? -> oModel.getProperty("selected", oContext);
			return !!this._keys[sKey];
		},

		_setSelectionForContext: function(oModel, oContext, bSelected) {
			var sKey;
			if (this._key === "$PATH") {
				sKey = oContext.getPath();
			} else {
				sKey = oModel.getProperty(this._key, oContext);
			}
			if (bSelected) {
				this._keys[sKey] = true;
			} else {
				delete this._keys[sKey];
			}
		},

		// Private

		_initializeSelectionModel: function() {
			if (!this.selectionmodel) {
				this.selectionmodel = new SelectionModel(SelectionModel.MULTI_SELECTION);
			} else {
				this.selectionmodel.clearSelection();
			}

			var aIndices = this._getSelectedIndicesFromModel();
			for (var i = 0; i < aIndices.length; i++) {
				this.selectionmodel.addSelectionInterval(aIndices[i], aIndices[i]);
			}

			if (this._doAfterInitSelectionModel) {
				this._doAfterInitSelectionModel();
			}
		},

		_doUpdateModelAfterSelectionChange: function(oEvent) {
			this._getSelectionModel().detachSelectionChanged(this._doUpdateModelAfterSelectionChange, this);
			this._updateModelAfterSelectionChange(oEvent);
		},

		_doChangeSelection: function(sChange, aArgs) {
			var oSelectionModel = this._getSelectionModel();
			oSelectionModel.attachSelectionChanged(this._doUpdateModelAfterSelectionChange, this);
			oSelectionModel[sChange].apply(oSelectionModel, aArgs);
		},

		_fireRowSelectionChange: function() {
			this.fireEvent("selectionChange", {selectedKeys: this.getSelectedKeys()});
		},

		syncParentNodeSelectionWithChildren: function(oRuleSetsModel) {
			var oTreeTableData = deepExtend({}, oRuleSetsModel.getData());

			Object.keys(oTreeTableData).forEach(function(iLibrary) {
				var flag = true;
				oTreeTableData[iLibrary].nodes.forEach(function (oRule) {
					if (!oRule.selected) {
						flag = false;
						oTreeTableData[iLibrary].selected = false;
					} else if (flag) {
						oTreeTableData[iLibrary].selected = true;
					}
				});
			});

			oRuleSetsModel.setData(oTreeTableData);
		},

		updateModelAfterChangedSelection: function(oModel, sPath, bSelected) {
			var aPath = sPath.split("/"),
				sLib = aPath[1];

			if (aPath[2]) { // selecting a rule
				if (oModel.getProperty("/" + sLib + "/nodes") !== 0) {
					oModel.setProperty("/" + sLib + "/nodes/" + aPath[3] + "/selected", bSelected);
				}
			} else { // selecting a library
				oModel.setProperty("/" + sLib + "/selected", bSelected);
			}
		}

	});


	return Selection;

});
