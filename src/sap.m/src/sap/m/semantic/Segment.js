/*!
 * ${copyright}
 */

/**
 * SemanticPage base classes
 *
 * @namespace
 * @name sap.m.semantic
 */

// Provides class sap.m.semantic.Segment
sap.ui.define(['sap/ui/base/Object', "sap/base/Log"], function(BaseObject, Log) {
	"use strict";

	/**
	 * Constructor for an sap.m.semantic.Segment.
	 *
	 * @class Abstraction for a segment in a SegmentedContainer
	 * @version ${version}
	 * @private
	 * @since 1.30.0
	 * @alias sap.m.semantic.Segment
	 */

	var Segment = BaseObject.extend("sap.m.semantic.Segment", {

		constructor : function(aContent, oContainer, sContainerAggregationName, fnSortFunction) {
			if (!oContainer) {
				Log.error("missing argumment: constructor expects a container reference", this);
				return;
			}

			aContent || (aContent = []);

			this._aContent = aContent;
			this._oContainer = oContainer;
			this._sContainerAggregationName = sContainerAggregationName;
			this._fnSortFunction = fnSortFunction;
		},

		getInterface: function() {
			return this; // no facade
		}

	});

	Segment.prototype.getStartIndex = function () {

		return 0;
	};

	Segment.prototype.getEndIndex = function () {

		return this.getStartIndex() + this._aContent.length;
	};

	Segment.prototype.getContent = function () {

		return this._aContent.slice();
	};

	Segment.prototype.indexOfContent = function (oControl) {

		return this._aContent.indexOf(oControl);
	};

	Segment.prototype.addContent = function (oControl, bSuppressInvalidate) {

		if (this._fnSortFunction) {
			var iInsertIndex = this._matchSortToInsertIndex(oControl);
			if (typeof iInsertIndex !== 'undefined') {
				this._insertContent(oControl, iInsertIndex, bSuppressInvalidate);
				return oControl;
			}
		}

		var iContainerInsertIndex = this.getEndIndex(),
			iLocalInsertIndex = this._aContent.length,
			sAggregationMethod  = "insert" + fnCapitalize(this._sContainerAggregationName);

		this._oContainer[sAggregationMethod](oControl, iContainerInsertIndex, bSuppressInvalidate);
		this._aContent.splice(iLocalInsertIndex, 0, oControl);

		return oControl;
	};

	Segment.prototype.insertContent = function (oControl, iIndex, bSuppressInvalidate) {

		if (this._fnSortFunction) {
			var iInsertIndex = this._matchSortToInsertIndex(oControl);
			if (typeof iInsertIndex !== 'undefined') {
				this._insertContent(oControl, iInsertIndex, bSuppressInvalidate);
				return oControl;
			}
		}

		return this._insertContent(oControl, iIndex, bSuppressInvalidate);
	};

	Segment.prototype.removeContent = function (oControl, bSuppressInvalidate) {

		var iLocalIndex = this._aContent.indexOf(oControl),
			sAggregationMethod  = "remove" + fnCapitalize(this._sContainerAggregationName);

		if (iLocalIndex > -1) {
			this._aContent.splice(iLocalIndex, 1);

			return this._oContainer[sAggregationMethod](oControl, bSuppressInvalidate);
		}
	};

	Segment.prototype.removeAllContent = function (bSuppressInvalidate) {

		var aRemovedContent = [],
			aGlobalContent = this._oContainer.getAggregation(this._sContainerAggregationName),
			iStartIndex = this.getStartIndex(),
			iEndIndex = this.getEndIndex(),
			sAggregationMethod  = "remove" + fnCapitalize(this._sContainerAggregationName);

		for (var i = iStartIndex; i < iEndIndex; i++) {
			var oItem = this._oContainer[sAggregationMethod](aGlobalContent[i], bSuppressInvalidate); //TODO: test index consistency upon iteration+removal
			if (oItem) {
				aRemovedContent.push(oItem);
			}
		}

		this._aContent = []; //remove from local index

		return aRemovedContent;
	};

	Segment.prototype.destroy = function (bSuppressInvalidate) {
		var aRemovedContent = this.removeAllContent(bSuppressInvalidate);
		for (var i = 0; i < aRemovedContent.length; i++) {
			aRemovedContent[i].destroy(bSuppressInvalidate);
		}
	};

	Segment.prototype._insertContent = function (oControl, iIndex, bSuppressInvalidate) {

		var iInsertIndexInContainer = Math.min(this.getStartIndex() + iIndex, this.getEndIndex()),
			sAggregationMethod  = "insert" + fnCapitalize(this._sContainerAggregationName);

		iInsertIndexInContainer = Math.max(iInsertIndexInContainer, 0);

		this._oContainer[sAggregationMethod](oControl, iInsertIndexInContainer, bSuppressInvalidate);
		this._aContent.splice(iIndex, 0, oControl);

		return oControl;
	};

	Segment.prototype._matchSortToInsertIndex = function(oControl) {

		for (var i = 0; i < this._aContent.length; i++) {
			if (this._fnSortFunction(oControl, this._aContent[i]) <= 0) { //oControl is smaller
				return i;
			}
		}
	};

	function fnCapitalize(sName) {
		return sName.charAt(0).toUpperCase() + sName.substring(1);
	}

	return Segment;

});