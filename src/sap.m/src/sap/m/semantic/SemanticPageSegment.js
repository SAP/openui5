/*!
 * ${copyright}
 */

/**
 * SemanticPage base classes
 *
 * @namespace
 * @name sap.m.semantic
 */

// Provides class sap.m.semantic.SemanticPageSegment
sap.ui.define(['jquery.sap.global'], function(jQuery) {
	"use strict";

	/**
	 * Constructor for a sap.m.semantic.SemanticPageSegment.
	 *
	 * @class Abstraction for a segment in a SegmentedContainer
	 * @version ${version}
	 * @private
	 * @since 1.30.0
	 * @alias sap.m.semantic.SemanticPageSegment
	 */
	var Segment = function (aContent, oContainer) {

		aContent || (aContent = []);

		this._aContent = aContent;
		this._oOrderedGroups = {};
		this._oContainer = oContainer;
	};

	Segment.prototype.getStartIndex = function () {

		return 0;
	};

	Segment.prototype.getEndIndex = function () {

		return this.getStartIndex() + this._aContent.length;
	};

	Segment.prototype.getContent = function () {

		return this._aContent;
	};

	Segment.prototype.indexOfContent = function (oControl) {

		return jQuery.inArray( oControl, this._aContent );
	};

	Segment.prototype.addContent = function (oControl, oSequenceOrderInfo, bSupressInvalidate) {

		// if the oControl to be added belongs to an ordered group,
		// then add it to its proper index within the ordered group
		if (oSequenceOrderInfo && oSequenceOrderInfo.sGroup && oSequenceOrderInfo.sGroup.length > 0) {
			return this._addToGroup(oControl, oSequenceOrderInfo.sGroup, oSequenceOrderInfo.iSequenceIndexInGroup, bSupressInvalidate);
		}

		this._addContent(oControl, bSupressInvalidate);

		return oControl;
	};

	Segment.prototype.insertContent = function (oControl, iIndex, oSequenceOrderInfo, bSupressInvalidate) {

		// if the oControl to be added belongs to an ordered group,
		// then insert it to the ordered group, passing the preferred insert iIndex
		if (oSequenceOrderInfo && oSequenceOrderInfo.sGroup && oSequenceOrderInfo.sGroup.length > 0) {
			return this._insertToGroup(oControl, iIndex, oSequenceOrderInfo.sGroup, oSequenceOrderInfo.iSequenceIndexInGroup, bSupressInvalidate);
		}

		return this._insertContent(oControl, iIndex, bSupressInvalidate);
	};

	Segment.prototype.removeContent = function (oControl, bSupressInvalidate) {

		var iLocalIndex = jQuery.inArray(oControl, this._aContent);
		if (iLocalIndex > -1) {
			this._aContent.splice(iLocalIndex, 1);

			this._removeFromGroups(oControl);

			return this._oContainer.removeContent(oControl, bSupressInvalidate);
		}
	};

	Segment.prototype.removeAllContent = function (bSupressInvalidate) {

		var aRemovedContent = [],
			aGlobalContent = this._oContainer.getContent(),
			iStartIndex = this.getStartIndex(),
			iEndIndex = this.getEndIndex();

		for (var i = iStartIndex; i < iEndIndex; i++) {
			var oItem = this._oContainer.removeContent(aGlobalContent[i], bSupressInvalidate); //TODO: test index consistency upon iteration+removal
			if (oItem) {
				this._removeFromGroups(oItem);
				aRemovedContent.push(oItem);
			}
		}

		this._aContent = []; //remove from local index

		return aRemovedContent;
	};

	Segment.prototype.destroy = function (bSupressInvalidate) {
		var aRemovedContent = this.removeAllContent(bSupressInvalidate);
		for (var i = 0; i < aRemovedContent.length; i++) {
			aRemovedContent[i].destroy(bSupressInvalidate);
		}
	};

	Segment.prototype._addContent = function (oControl, bSupressInvalidate) {

		var iContainerInsertIndex = this.getEndIndex();
		var iLocalInsertIndex = this._aContent.length;

		this._oContainer.insertContent(oControl, iContainerInsertIndex, bSupressInvalidate);
		this._aContent.splice(iLocalInsertIndex, 0, oControl);

		return oControl;
	};

	Segment.prototype._insertContent = function (oControl, iIndex, bSupressInvalidate) {

		var iInsertIndexInContainer = Math.min(this.getStartIndex() + iIndex, this.getEndIndex());
		iInsertIndexInContainer = Math.max(iInsertIndexInContainer, 0);

		this._oContainer.insertContent(oControl, iInsertIndexInContainer, bSupressInvalidate);
		this._aContent.splice(iIndex, 0, oControl);

		return oControl;
	};

	/*
	 Positions oControl with respect to the positions of existing sibings from the same ordered froup
	 */
	Segment.prototype._addToGroup = function (oControl, sGroup, iSequenceIndexInGroup, bSupressInvalidate) {

		this._oOrderedGroups[sGroup] || (this._oOrderedGroups[sGroup] = []);
		var aGroup = this._oOrderedGroups[sGroup];
		var iIndexInContent;

		if (aGroup.length > 0) {
			//find proper insert index of oControl in content, with respect to the indexes of existing siblings from the ordered group
			iIndexInContent = this._findIndexInContent(aGroup, iSequenceIndexInGroup);
		}

		aGroup[iSequenceIndexInGroup] = oControl;

		if (iIndexInContent != undefined) {
			this._insertContent(oControl, iIndexInContent, bSupressInvalidate);
		} else {//no siblings found so simply add
			this._addContent(oControl, bSupressInvalidate);
		}
	};

	Segment.prototype._insertToGroup = function (oControl, iIndexInContent, sGroup, iSequenceIndexInGroup, bSupressInvalidate) {

		if (this._oOrderedGroups[sGroup]) {//existing group
			return this._addToGroup(oControl, sGroup, iSequenceIndexInGroup, bSupressInvalidate);
		}

		this._insertContent(oControl, iIndexInContent, bSupressInvalidate);

		this._oOrderedGroups[sGroup] = [];
		this._oOrderedGroups[sGroup][iSequenceIndexInGroup] = oControl;

		return oControl;
	};

	Segment.prototype._getLowerSibling = function(aGroup, iSequenceIndexInGroup) {
		for (var i = (iSequenceIndexInGroup - 1); i >= 0; i--) {
			var oLowerSibling = aGroup[i];
			if (oLowerSibling) {
				return oLowerSibling;
			}
		}
	};

	Segment.prototype._getHigherSibling = function(aGroup, iSequenceIndexInGroup) {
		for (var i = (iSequenceIndexInGroup + 1); i < aGroup.length; i++) {
			var oHigherSibling = aGroup[i];
			if (oHigherSibling) {
				return oHigherSibling;
			}
		}
	};

	//finds proper insert index of oControl in content, with respect to the indexes of existing siblings from the ordered group
	Segment.prototype._findIndexInContent = function(aGroup, iSequenceIndexInGroup) {

		var oLowerSibling = this._getLowerSibling(aGroup, iSequenceIndexInGroup);
		if (oLowerSibling) {
			return this.indexOfContent(oLowerSibling) + 1;
		} else {
			var oHigherSibling = this._getHigherSibling(aGroup, iSequenceIndexInGroup);
			if (oHigherSibling) {
				return this.indexOfContent(oHigherSibling);
			}
		}
	};

	Segment.prototype._removeFromGroups = function(oControl) {

		jQuery.each(this._oOrderedGroups, function(sGroup, aGroup) {
			var iIndex = jQuery.inArray(oControl, aGroup);
			if (iIndex > -1) {
				delete aGroup[iIndex];
				if (aGroup.length == 0) { //delete entire group if remains empty
					delete this._oOrderedGroups[sGroup];
				}
				return;
			}
		});
	};

	return Segment;

}, /* bExport= */ false);
