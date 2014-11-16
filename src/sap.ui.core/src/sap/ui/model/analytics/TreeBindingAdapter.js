/*!
 * ${copyright}
 */

// Provides class sap.ui.model.odata.ODataAnnotations
sap.ui.define(['jquery.sap.global', 'sap/ui/model/TreeBinding', './AnalyticalBinding'],
	function(jQuery, TreeBinding, AnalyticalBinding) {
	"use strict";

	/**
	 * Adapter for TreeBindings to add the ListBinding functionality and use the 
	 * tree structure in list based controls.
	 *
	 * @alias sap.ui.model.analytics.TreeBindingAdapter
	 * @function
	 * @experimental This module is only for experimental use!
	 * @protected
	 */
	var TreeBindingAdapter = function() {
	
		// ensure only TreeBindings are enhanced which have not been enhanced yet
		if (!(this instanceof TreeBinding && this.getContexts === undefined)) {
			return;
		}
	
		// apply the methods of the adapters prototype to the TreeBinding instance
		for (var fn in TreeBindingAdapter.prototype) {
			if (TreeBindingAdapter.prototype.hasOwnProperty(fn)) {
				this[fn] = TreeBindingAdapter.prototype[fn];
			}
		}
		
		// initialize the contexts
		this._aContexts = [];
		this._aContextInfos = [];
		this._bInitial = true;
		
		//store all contexts that are currently expanded to enable automatic reopening of groups
		this._oExpanded = {};
		this._oOpenGroups = {};
		this._bTriggeredOpenGroupsLoad = false;
	};
	
	TreeBindingAdapter.prototype._updateContexts = function(iPosition, aContexts, aContextInfos, bReplace) {
		var iInitialPosition = iPosition;
		for ( var i = 0; i < aContexts.length; i++) {
			var oContext = aContexts[i];
			var oContextInfo = aContextInfos[i];
			this._aContexts.splice(iPosition, bReplace ? 1 : 0, oContext);
			this._aContextInfos.splice(iPosition, bReplace ? 1 : 0, oContextInfo);
			iPosition++;
		}
		if (!bReplace) {
			this._fireContextChange({
				type: "insert",
				index: iInitialPosition,
				length: aContexts.length
			});
		}
	
		return aContextInfos;
	};
	
	TreeBindingAdapter.prototype.getLength = function() {
		return this._aContexts.length;
	};
	
	TreeBindingAdapter.prototype.getContextInfo = function(iIndex) {
		return this._aContextInfos.slice(iIndex, iIndex + 1)[0];
	};
	
	TreeBindingAdapter.prototype._createContextInfos = function(aContexts, oParent, iPosition, iLevel, iLength, iThreshold, bSum, iIndexOffset, iAutoExpandLevels) {
		if (!iIndexOffset) {
			iIndexOffset = 0;
		}
		var aContextInfos = [];
		for ( var i = 0; i < aContexts.length; i++) {
			var oChildContext = aContexts[i];
			aContextInfos.push({
				context: oChildContext,
				level: iLevel,
				expanded: false,
				childCount: 0,
				parent: oParent,
				sum: bSum,
				position: iPosition,
				index: i + iIndexOffset,
				autoExpand: iAutoExpandLevels,
				expandLength: iLength,
				expandThreshold: iThreshold
			});
			iPosition++;
		}
		return aContextInfos;
	};
	
	TreeBindingAdapter.prototype.getContexts = function(iStartIndex, iLength, iThreshold) {
	
		var that = this;
	
		// by default the length is like the sizelimit of the model
		if (!iLength) {
			iLength = this.oModel.iSizeLimit;
		}
	
		if (this._bInitial) {
			//Get number of expandend levels from the parameters
			var iNumberOfExpandedLevels = this.mParameters && this.mParameters.numberOfExpandedLevels;
			var aRootContexts = this.getRootContexts({
				startIndex: iStartIndex,
				length: iLength,
				threshold: iThreshold,
				numberOfExpandedLevels:iNumberOfExpandedLevels
			});
			if (aRootContexts && aRootContexts.length > 0) {
				this._bInitial = false;
				var aNewContextInfos = this._createContextInfos(aRootContexts, null, 0, 0, iLength, iThreshold, true, 0, parseInt(iNumberOfExpandedLevels, 10) + 1);
				if (this.bProvideGrandTotals && this.hasTotaledMeasures()) {
					this._updateContexts(0, aRootContexts, aNewContextInfos);
				} else {
					//If no grand totals should be displayed, we need to expand at least 1 level
					this._expandNodesForContexts(aNewContextInfos, 0, iLength, iThreshold);
				}
			}
		}
	
		if (this._oOpenGroups != {} && this._bTriggeredOpenGroupsLoad == false) {
			this.loadGroups(this._oOpenGroups);
			this._bTriggeredOpenGroupsLoad = true;
		}

		
		//Expand all nodes with autoExpand > 0 in fetched section
		this._expandNodesForContexts(this._aContextInfos.slice(iStartIndex, iStartIndex + iLength), iStartIndex, iLength, iThreshold);

		// returns the context from the start index with the specified length 
		var aContexts = this._aContexts.slice(iStartIndex, iStartIndex + iLength);

		var oMissingSections = {};
	
		jQuery.each(aContexts, function(iIndex, oContext) {
			if (!oContext) {
				var oContextInfo = that._aContextInfos[iStartIndex + iIndex];
				var oParent = oContextInfo.parent;
				var oSection = oMissingSections[oParent.getPath()];
				if (oSection) {
					oSection.startIndex = Math.min(oSection.startIndex, oContextInfo.index);
					oSection.position = Math.min(oSection.position, oContextInfo.position);
					oSection.endIndex = Math.max(oSection.endIndex, oContextInfo.index);
				} else {
					oMissingSections[oParent.getPath()] = {
						startIndex: oContextInfo.index,
						endIndex: oContextInfo.index,
						parent: oContextInfo.parent,
						level: oContextInfo.level - 1,
						position: oContextInfo.position
					};
				}
			}
		});
	
		//Load contexts from missing sections
		var that = this,
			bUpdatedMissingSection = false;
		jQuery.each(oMissingSections, function(iIndex, oSection) {
			var iSectionLength = oSection.endIndex - oSection.startIndex + 1;
			var iAutoExpand = Math.max(that.mParameters.numberOfExpandedLevels - oSection.level, 0);
			var aMissingContexts = that.getNodeContexts(oSection.parent, {
				startIndex: oSection.startIndex,
				length: iSectionLength,
				threshold: iThreshold,
				level: oSection.level,
				numberOfExpandedLevels: iAutoExpand
			});
			if (aMissingContexts.length > 0) {
				// integrate the contexts into the local context cache
				that._updateContexts(oSection.position, aMissingContexts, that._createContextInfos(aMissingContexts, oSection.parent, oSection.position, oSection.level + 1, iSectionLength, iThreshold, false, 0, iAutoExpand), true);
				that._updateExpandedInfo(oSection.parent, oSection.level, oSection.startIndex, oSection.endIndex - oSection.startIndex + 1, iThreshold);
				bUpdatedMissingSection = true;
			}
		});
		
		if (bUpdatedMissingSection) {
			//Expand all nodes with autoExpand > 0 in fetched section
			this._expandNodesForContexts(this._aContextInfos.slice(iStartIndex, iStartIndex + iLength), iStartIndex, iLength, iThreshold);
			aContexts = this._aContexts.slice(iStartIndex, iStartIndex + iLength);
		}
	
		return aContexts;
	};
	
	TreeBindingAdapter.prototype._expandNodesForContexts = function(aContexts, iStartIndex, iLength, iThreshold) {
		//Expand all nodes with autoExpand > 0 in fetched section
		var aExpandContextInfos = jQuery.grep(aContexts, function(oContextInfo) {
			return oContextInfo.autoExpand > 0;
		});
		for (var i = 0; i < aExpandContextInfos.length; i++) {
			this._expandNode(aExpandContextInfos[i], iStartIndex, iLength, iThreshold);
		}
	};
	
	TreeBindingAdapter.prototype._expandNode = function(oContextInfo, iStartIndex, iLength, iThreshold) {
		var oContext = oContextInfo.context,
			iNodeLength = oContextInfo.expandLength,
			iNodeTheshold = oContextInfo.expandThreshold,
			bHasMeasures = this.hasMeasures();
		
		if (!(oContextInfo.position >= iStartIndex && oContextInfo.position <= iStartIndex + iLength) || oContextInfo.expanded === true) {
			return;
		}
		
		var aContexts = this.getNodeContexts(oContext, {
			startIndex: 0,
			length: iNodeLength,
			threshold: iNodeTheshold,
			level: oContextInfo.level,
			numberOfExpandedLevels: oContextInfo.autoExpand ? oContextInfo.autoExpand - 1 : 0
		});
		
		if (aContexts && aContexts.length > 0) {
			var iRealLength = this.getGroupSize(oContext, oContextInfo.level),
				iInitialPosition = oContextInfo.parent ? oContextInfo.position + 1 : 0,
				iPosition = iInitialPosition,
				iLevel = oContextInfo.level + 1,
				iInitialLevel = iLevel,
				aContextInfos = this._createContextInfos(aContexts, oContext, iPosition, iLevel, iNodeLength, iNodeTheshold, false, 0, oContextInfo.autoExpand ? oContextInfo.autoExpand - 1 : 0);
	
			iPosition += aContextInfos.length;
			var iIndexOffset = aContextInfos.length;
	
			if (iRealLength > -1) {
				for (var j = aContexts.length; j < iRealLength; j++) {
					aContexts.push(undefined);
					aContextInfos.push(this._createContextInfos([undefined], oContext, iPosition, iLevel, iLength, iThreshold, false, iIndexOffset, oContextInfo.autoExpand ? oContextInfo.autoExpand - 1 : 0)[0]);
					iPosition++;
					iIndexOffset++;
				}
			}
	
			// add parent context as sum context
			if (oContext && oContextInfo.parent != null && iRealLength > 1 && !this.mParameters.sumOnTop && bHasMeasures && this.bProvideGrandTotals) {
				aContexts.push(oContext);
				aContextInfos.push(this._createContextInfos([oContext], oContext, iPosition, iLevel - 1, iLength, iThreshold, true, iIndexOffset, 0)[0]);
			}
	
			var iContextLength = aContexts.length;
			this._updateContexts(iInitialPosition, aContexts, aContextInfos);
			
			var iLastInsertPosition = iInitialPosition + iContextLength;
	
			// iterate through the parent contexts to increase the child count
			var oParentContextInfo;
			iLevel--;
			var iIteratePosition = iInitialPosition;
			while ((oParentContextInfo = this._aContextInfos[iIteratePosition]) !== undefined) {
				if (oParentContextInfo.level == iLevel) {
					oParentContextInfo.childCount = oParentContextInfo.childCount + iContextLength;
					iLevel--;
				}
				iIteratePosition--;
				if (iLevel < 0) {
					break;
				}
			}
			
			var oLastInsertPositionContexInfo = this._aContextInfos[iLastInsertPosition];
			if (oLastInsertPositionContexInfo) {
				var iIncrease = this._aContextInfos[iLastInsertPosition - 1].position - oLastInsertPositionContexInfo.position + 1;
				
				for (var j = iLastInsertPosition; j < this._aContextInfos.length; j++) {
					this._aContextInfos[j].position += iIncrease;
				}
			}
	
			if (oContextInfo) { //not defined for root
				oContextInfo.expanded = true;
			}
			this._updateExpandedInfo(oContextInfo.context, oContextInfo.level, 0, iLength, iThreshold);
			
			var bAdded = false;
			for (var j = 0; j < aContexts.length; j++) {
				if (iInitialLevel <= this.aAggregationLevel.length && this._oOpenGroups[this._getGroupIdFromContext(aContexts[j], iInitialLevel)]) {
					this._expandNode(aContextInfos[j], iStartIndex, iLength, iThreshold);
					delete this._oOpenGroups[this._getGroupIdFromContext(aContexts[j], iInitialLevel)];
					bAdded = true;
				}
				if (aContextInfos[j].autoExpand > 0 && this.hasAvailableNodeContexts(aContexts[j], iInitialLevel) > 0 && !bAdded) {
					this._expandNode(aContextInfos[j], iStartIndex, iLength, iThreshold);
				}
			}
			
			//reset expand info
			oContextInfo.autoExpand = 0;
		}
	};
	
	TreeBindingAdapter.prototype._updateExpandedInfo = function(oContext, iLevel, iStartIndex, iLength, iThreshold) {
		var sAbsolutePath = this._getGroupIdFromContext(oContext, iLevel);
		var aPath = sAbsolutePath.substr(0, sAbsolutePath.length - 1).split("/");
		var oExpanded = this._oExpanded;
		for (var j = 0; j < aPath.length; j++) {
			var sPath = aPath[j];
			if (j == 0) {
				sPath = "root";
			}
			oExpanded[sPath] = oExpanded[sPath] || {};
			oExpanded = oExpanded[sPath];
			if (j == aPath.length - 1) {
				oExpanded["sections"] = oExpanded["sections"] || [];
				if (oExpanded["sections"].length == 0) {
					oExpanded["sections"].push({
						startIndex: iStartIndex,
						length: iLength,
						threshold: iThreshold
					});
				}
				var bEditedSection = false;
				for (var k = 0; k < oExpanded["sections"].length; k++) {
					var oSection = oExpanded["sections"][k];
					var iSectionEndIndex = oSection.startIndex + oSection.length + oSection.threshold;
					var iEndIndex = iStartIndex + iLength + iThreshold;
					if (oSection.startIndex <= iStartIndex && iSectionEndIndex >= iEndIndex) {
						//Sections is already part of another section
						return;
					} else if (oSection.startIndex <= iStartIndex && iSectionEndIndex >= iStartIndex) {
						//Section starts within current section -> enlarge
						oSection.threshold = Math.max(oSection.threshold, iThreshold);
						oSection.length = iEndIndex - oSection.startIndex - oSection.threshold;
						bEditedSection = true;
					} else if (oSection.startIndex > iStartIndex && iSectionEndIndex > iEndIndex) {
						//Sections ends in existing section
						oSection.length = oSection.length + (oSection.startIndex - iStartIndex);
						oSection.startIndex = iStartIndex;
						oSection.threshold = Math.max(oSection.threshold, iThreshold);
						bEditedSection = true;
					} else if (oSection.startIndex > iStartIndex && oSection.endIndex < iEndIndex) {
						//Replace section
						oSection.startIndex = iStartIndex;
						oSection.length = iLength;
						oSection.threshold = iThreshold;
						bEditedSection = true;
					}
				}
				if (!bEditedSection) {
					oExpanded["sections"].push({
						startIndex: iStartIndex,
						length: iLength,
						threshold: iThreshold
					});
				}
			} else {
				oExpanded["children"] = oExpanded["children"] || {};
				oExpanded["childProperty"] = this.aAggregationLevel[j];
				oExpanded = oExpanded["children"];
			}
		}
	};

	
	TreeBindingAdapter.prototype.expand = function(iIndex) {
		var oContextInfo = this._aContextInfos[iIndex];
		// if the context is already expanded => return
		if (oContextInfo.expanded) {
			return;
		}
		
		oContextInfo.autoExpand = oContextInfo.autoExpand || 1;
	};
	
	TreeBindingAdapter.prototype.collapse = function(iIndex) {
	
		var oContextInfo = this._aContextInfos[iIndex];
		var oContext = this._aContexts[iIndex];

		// if the context is already collapsed => return
		// the root node cannot be collapsed => return
		if (!oContextInfo.expanded) {
			return;
		}
	
		// determine the position of the context incl. length and level
		var iPosition = oContextInfo.position + 1,
			iLength = oContextInfo.childCount,
			iLevel = oContextInfo.level;
		
		var oExpanded = this._oExpanded["root"];
		var sAbsolutePath = this._getGroupIdFromContext(oContext, iLevel);
		var aPath = sAbsolutePath.substr(0, sAbsolutePath.length - 1).split("/");
		for (var i = 1; i < iLevel; i++) {
			oExpanded = oExpanded["children"][aPath[i]];
		}
		delete oExpanded["children"][aPath[aPath.length - 1]];
	
		// remove the child nodes
		var iRemovePosition = iPosition;
		this._aContexts.splice(iPosition, iLength);
		this._aContextInfos.splice(iPosition, iLength);
		
		iPosition--;
		
	
		// update the parent nodes with the new length/child count
		var oParentContextInfo;
		while ((oParentContextInfo = this._aContextInfos[iPosition]) !== undefined) {
			if (oParentContextInfo.level == iLevel) {
				oParentContextInfo.childCount = oParentContextInfo.childCount - iLength;
				iLevel--;
			}
			iPosition--;
			if (iLevel < 0) {
				break;
			}
		}
		
		if (iRemovePosition < this._aContextInfos.length) {
			var iDecrease = this._aContextInfos[iRemovePosition - 1].position - this._aContextInfos[iRemovePosition].position + 1;
			
			for (var j = iRemovePosition; j < this._aContextInfos.length; j++) {
				this._aContextInfos[j].position += iDecrease;
			}
			
			this._fireContextChange({
				type: "remove",
				index: iRemovePosition,
				length: Math.abs(iDecrease)
			});
		}
	
		// node is collapse now => notifiy control
		oContextInfo.expanded = false;
	};
	
	TreeBindingAdapter.prototype.collapseAll = function(iLevel) {
		if (!iLevel || iLevel < 1) {
			iLevel = 1;
		}
		for (var i = 0, j = this._aContextInfos.length; i < j; i++) {
			if (this._aContextInfos[i].level == iLevel) {
				this.collapse(i);
				j = this._aContextInfos.length;
			}
		}
	};
	
	TreeBindingAdapter.prototype.toggleIndex = function(iIndex) {
		//length attribute contains how many rows could be potentially displayed below the expanded context
		if (!this._aContextInfos[iIndex].expanded) {
			this.expand(iIndex);
		} else {
			this.collapse(iIndex);
		}
	};
	
	TreeBindingAdapter.prototype.indexHasChildren = function(iIndex) {
		var oContextInfo = this._aContextInfos[iIndex];
		if (!oContextInfo.parent || oContextInfo.sum) {
			return false;
		} else {
			return AnalyticalBinding.prototype.hasChildren.call(this, oContextInfo.context, { level: oContextInfo.level });
		}
	};
	
	TreeBindingAdapter.prototype.resetData = function(oContext) {
		var vReturn = AnalyticalBinding.prototype.resetData.call(this, oContext);
		this._aContexts = [];
		this._aContextInfos = [];
		this._oOpenGroups = {};
		this._removeGroups(this._oExpanded["root"], 0, '');
		this._oExpanded = {};
		this._bInitial = true;
		this._bTriggeredOpenGroupsLoad = false;
		return vReturn;
	};
	
	TreeBindingAdapter.prototype.updateAnalyticalInfo = function(aColumns) {
		var vReturn = AnalyticalBinding.prototype.updateAnalyticalInfo.call(this, aColumns);
		this._aContexts = [];
		this._aContextInfos = [];
		this._oOpenGroups = {};
		this._removeGroups(this._oExpanded["root"], 0, '');
		this._oExpanded = {};
		this._bInitial = true;
		this._bTriggeredOpenGroupsLoad = false;
		return vReturn;
	};

	TreeBindingAdapter.prototype._removeGroups = function(oGroup, iLevel, sPrefix) {
		if (!oGroup) {
			return;
		}

		this._oOpenGroups[sPrefix + '/'] = oGroup.sections;

		if (!oGroup.childProperty) {
			return;
		}

		if (oGroup.childProperty != this.aAggregationLevel[iLevel]) {
			delete oGroup.children;
			delete oGroup.childProperty;
		} else {
			for (var child in oGroup.children) {
				this._removeGroups(oGroup.children[child], iLevel + 1, sPrefix + '/' + child);
			}
		}

	};
	
	TreeBindingAdapter.prototype.hasTotaledMeasures = function() {
		var bHasMeasures = false;
		jQuery.each(this.getMeasureDetails(), function(iIndex, oMeasure) {
			if (oMeasure.analyticalInfo.total) {
				bHasMeasures = true;
				return false;
			}
		});
		return bHasMeasures;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'contextChange' event of this <code>sap.ui.model.analytics.TreeBindingAdapter</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 */
	TreeBindingAdapter.prototype.attachContextChange = function(fnFunction, oListener) {
		this.attachEvent("contextChange", fnFunction, oListener);
	};
	
	/**
	 * Detach event-handler <code>fnFunction</code> from the 'contextChange' event of this <code>sap.ui.model.analytics.TreeBindingAdapter</code>.<br/>
	 * @param {function} fnFunction The function to call, when the event occurs.
	 * @param {object} [oListener] object on which to call the given function.
	 * @protected
	 */
	TreeBindingAdapter.prototype.detachContextChange = function(fnFunction, oListener) {
		this.detachEvent("contextChange", fnFunction, oListener);
	};
	
	/**
	 * Fire event contextChange to attached listeners.
	 * @param {Map} [mArguments] the arguments to pass along with the event.
	 * @private
	 */
	TreeBindingAdapter.prototype._fireContextChange = function(mArguments) {
		this.fireEvent("contextChange", mArguments);
	};

	return TreeBindingAdapter;
	
}, /* bExport= */ true);
