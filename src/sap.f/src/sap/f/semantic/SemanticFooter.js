/*!
 * ${copyright}
 */

/**
* Provides a private class <code>sap.f.semantic.SemanticFooter</code>.
*/
sap.ui.define([
	"sap/m/ToolbarSpacer",
	"sap/m/library",
	"./SemanticContainer"
], function(ToolBarSpacer,
			mobileLibrary,
			SemanticContainer) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	/**
	* Constructor for a <code>sap.f.semantic.SemanticFooter</code>.
	*
	* @private
	* @since 1.46.0
	* @alias sap.f.semantic.SemanticFooter
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var SemanticFooter = SemanticContainer.extend("sap.f.semantic.SemanticFooter", {
		constructor : function(oContainer, oParent) {
			SemanticContainer.call(this, oContainer, oParent);

			this._aCustomContent = [];
			this._aSemanticLeftContent = [];
			this._aSemanticRightContent = [];
			this._iSemanticLeftContentCount = 1;

			this._fnParentSubstitute = function () {
				return this._oParent;
			}.bind(this);

			this._insertSpacer();
		}
	});

	SemanticFooter.mPlacementMethodMap = {
		footerLeft: "LeftContent",
		footerRight: "RightContent"
	};

	/*
	 * CUSTOM CONTENT aggregation methods
	 */
	SemanticFooter.prototype.addCustomAction = function(oCustomControl) {
		oCustomControl.setType(ButtonType.Transparent);
		this._callContainerAggregationMethod("addContent", oCustomControl);
		this._aCustomContent.push(oCustomControl);
		return this;
	};

	SemanticFooter.prototype.insertCustomAction = function(oCustomControl, iIndex) {
		var iContainerIndex = this._getCustomContentInsertIndex(iIndex);

		oCustomControl.setType(ButtonType.Transparent);
		this._callContainerAggregationMethod("insertContent", oCustomControl, iContainerIndex);
		this._aCustomContent.splice(iIndex, 0, oCustomControl);
		return this;
	};

	SemanticFooter.prototype.getCustomActions = function() {
		return this._aCustomContent;
	};

	SemanticFooter.prototype.indexOfCustomAction = function(oCustomControl) {
		return this._aCustomContent.indexOf(oCustomControl);
	};

	SemanticFooter.prototype.removeCustomAction = function(oCustomControl) {
		var vResult =  this._callContainerAggregationMethod("removeContent", oCustomControl);
		this._aCustomContent.splice(this._aCustomContent.indexOf(oCustomControl), 1);
		return vResult;
	};

	SemanticFooter.prototype.removeAllCustomActions = function() {
		var aResult = [];

		this._aCustomContent.forEach(function(oCustomControl){
			var vResult = this._callContainerAggregationMethod("removeContent", oCustomControl);
			if (vResult) {
				aResult.push(oCustomControl);
			}
		}, this);

		this._aCustomContent = [];
		return aResult;
	};

	SemanticFooter.prototype.destroyCustomActions = function() {
		this.removeAllCustomActions(true).forEach(
			function(oCustomControl){
				oCustomControl.destroy();
			});

		return this;
	};

	/*
	* SEMANTIC CONTENT
	*/

	/*
	* Adds <code>sap.f.semantic.SemanticControl</code> to the container.
	*
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @param {String} sPlacement
	* @returns {sap.f.semantic.SemanticFooter}
	*/
	SemanticFooter.prototype.addContent = function(oSemanticControl, sPlacement) {
		this["_insertSemantic" + SemanticFooter.mPlacementMethodMap[sPlacement]].call(this, oSemanticControl);
		return this;
	};

	/*
	* Removes the <code>sap.f.semantic.SemanticControl</code> from the container.
	*
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @param {String} sPlacement
	* @returns {sap.f.semantic.SemanticFooter}
	*/
	SemanticFooter.prototype.removeContent = function(oSemanticControl, sPlacement) {
		this["_removeSemantic" + SemanticFooter.mPlacementMethodMap[sPlacement]].call(this, oSemanticControl);
		return this;
	};

	/*
	* Destroys all the actions - custom and semantic
	* and cleans all the references in use.
	*
	* @returns {sap.f.semantic.SemanticFooter}
	*/
	SemanticFooter.prototype.destroy = function() {
		this._aCustomContent = null;
		this._aSemanticLeftContent = null;
		this._aSemanticRightContent = null;
		this._oSpacer = null;

		return SemanticContainer.prototype.destroy.call(this);
	};

	/*
	* Inserts the <code>sap.f.semantic.SemanticControl</code> in the <code>footerLeft</code> area.
	*
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticFooter}
	*/
	SemanticFooter.prototype._insertSemanticLeftContent = function(oSemanticControl) {
		var oControl = this._getControl(oSemanticControl),
			iControlOrder = this._getControlOrder(oSemanticControl),
			iIndexToInsert = this._getSemanticLeftContentInsertIndex(iControlOrder);

		this._callContainerAggregationMethod("insertContent", oControl, iIndexToInsert);
		this._iSemanticLeftContentCount ++;
		this._aSemanticLeftContent.push(oSemanticControl);

		return this;
	};

	/*
	* Inserts the <code>sap.f.semantic.SemanticControl</code> in the <code>footerRight</code> area.
	*
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticFooter}
	*/
	SemanticFooter.prototype._insertSemanticRightContent = function(oSemanticControl) {
		var oControl = this._getControl(oSemanticControl);

		this._aSemanticRightContent.push(oSemanticControl);
		this._callContainerAggregationMethod("insertContent",  oControl, this._getSemanticRightContentInsertIndex(oSemanticControl));
		if (this._shouldBePreprocessed(oSemanticControl)) {
			this._preProcessControl(oControl);
		}

		return this;
	};

	/*
	* Removes the <code>sap.f.semantic.SemanticControl</code> from the <code>footerLeft</code> area.
	*
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticControl}
	*/
	SemanticFooter.prototype._removeSemanticLeftContent = function(oSemanticControl) {
		var oControl = this._getControl(oSemanticControl);

		this._callContainerAggregationMethod("removeContent", oControl);
		this._iSemanticLeftContentCount --;
		this._aSemanticLeftContent.splice(this._aSemanticLeftContent.indexOf(oControl), 1);
		return oSemanticControl;
	};

	/*
	* Removes the <code>sap.f.semantic.SemanticControl</code> from the <code>footerRight</code> area.
	*
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticControl}
	*/
	SemanticFooter.prototype._removeSemanticRightContent = function(oSemanticControl) {
		var oControl = this._getControl(oSemanticControl);

		this._callContainerAggregationMethod("removeContent", oControl);
		this._aSemanticRightContent.splice(this._aSemanticRightContent.indexOf(oSemanticControl), 1);
		this._postProcessControl(oControl);

		return oSemanticControl;
	};

	/*
	* Determines the insert index of the content that is about to be added
	* in the <code>footerLeft</code> area.
	*
	* @returns {Number}
	*/
	SemanticFooter.prototype._getSemanticLeftContentInsertIndex = function(iControlOrder) {
		return this._iSemanticLeftContentCount > 1 ? iControlOrder : 0;
	};

	/*
	* Determines the insert index of the content that is about to be added
	* in the <code>footerRight</code> area.
	*
	* @returns {Number}
	*/
	SemanticFooter.prototype._getSemanticRightContentInsertIndex = function(oSemanticControl) {
		this._aSemanticRightContent.sort(this._sortControlByOrder.bind(this));
		return this._iSemanticLeftContentCount + this._aSemanticRightContent.indexOf(oSemanticControl);
	};

	/*
	* Determines the insert index of the content that is about to be added
	* in the <code>customContent</code> area.
	*
	* @returns {Number}
	*/
	SemanticFooter.prototype._getCustomContentInsertIndex = function(iIndex) {
		return iIndex + this._iSemanticLeftContentCount + this._aSemanticRightContent.length;
	};

	/*
	* Inserts a <code>sap.m.ToolbarSpacer</code>
	* between the <code>footerLeft</code> and <code>footerRight</code> areas.
	*
	* @returns {sap.f.semantic.SemanticFooter}
	*/
	SemanticFooter.prototype._insertSpacer = function() {
		this._callContainerAggregationMethod("addContent", this._getSpacer());
		return this;
	};

	/*
	* Returns lazily a <code>sap.m.ToolbarSpacer</code> instance.
	*
	* @returns {sap.m.ToolbarSpacer}
	*/
	SemanticFooter.prototype._getSpacer = function() {
		if (!this._oSpacer) {
			this._oSpacer = new ToolBarSpacer();
		}
		return this._oSpacer;
	};

	/**
	* Preprocesses a control, added or inserted to the container <code>aggregation</code>.
	* The control would have the <code>SemanticPage</code> as its parent, rather than its real parent,
	* which is the result after forwarding the control to the <code>SemanticPage</code> internally aggregated controls.
	* This is achieved by overriding the control <code>getParent</code> method.
	*
	* @param oControl
	* @private
	*/
	SemanticFooter.prototype._preProcessControl = function (oControl) {
		if (!(typeof oControl._fnOriginalGetParent === "function")) {
			oControl._fnOriginalGetParent = oControl.getParent;
			oControl.getParent = this._fnParentSubstitute;
		}
	};

	/**
	* Post-processes a control, removed from the container <code>aggregation</code>,
	* so it returns its real parent by restoring the core <code>getParent</code> method,
	* allowing proper processing by the framework.
	*
	* @param {sap}oControl
	* @private
	*/
	SemanticFooter.prototype._postProcessControl = function (oControl) {
		if (oControl._fnOriginalGetParent) {
			oControl.getParent = oControl._fnOriginalGetParent;
			delete oControl._fnOriginalGetParent;
		}
	};

	return SemanticFooter;

});