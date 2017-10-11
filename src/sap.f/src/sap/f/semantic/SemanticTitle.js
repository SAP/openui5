/*!
 * ${copyright}
 */

/**
 * Provides a private class <code>sap.f.semantic.SemanticTitle</code>.
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/library",
	"./SemanticContainer"
], function(jQuery,
			mobileLibrary,
			SemanticContainer) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	/**
	 * Constructor for a <code>sap.f.semantic.SemanticTitle</code>.
	 *
	 * @private
	 * @since 1.46.0
	 * @alias sap.f.semantic.SemanticTitle
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SemanticTitle = SemanticContainer.extend("sap.f.semantic.SemanticTitle", {
		constructor : function(oContainer, oParent) {
			SemanticContainer.call(this, oContainer, oParent);

			this._iMainActionCount = 0;
			this._aSemanticTextActions = [];
			this._aSemanticSimpleIconActions = [];
			this._aSemanticNavIconActions = [];
			this._aCustomTextActions = [];
			this._aCustomIconActions = [];
		}
	});

	SemanticTitle.mPlacementMethodMap = {
		titleText: "TextContent",
		titleIcon: "IconContent",
		shareIcon: "ShareContent"
	};

	/*
	* PUBLIC METHODS
	*/

	/*
	* Adds <code>sap.f.semantic.SemanticControl</code> to the container.
	*
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @param {String} sPlacement
	* @returns {sap.f.semantic.SemanticFooter}
	*/
	SemanticTitle.prototype.addContent = function(oSemanticControl, sPlacement) {
		this["_insertSemantic" + SemanticTitle.mPlacementMethodMap[sPlacement]].call(this, oSemanticControl);
		return this;
	};

	/*
	* Removes the <code>sap.f.semantic.SemanticControl</code> from the container.
	*
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @param {String} sPlacement
	* @returns {sap.f.semantic.SemanticFooter}
	*/
	SemanticTitle.prototype.removeContent = function(oSemanticControl, sPlacement) {
		this["_removeSemantic" + SemanticTitle.mPlacementMethodMap[sPlacement]].call(this, oSemanticControl);
		return this;
	};

	/*
	* Destroys all the actions - custom and semantic
	* and cleans all the references in use.
	*
	* @returns {sap.f.semantic.SemanticFooter}
	*/
	SemanticTitle.prototype.destroy = function() {
		this._aSemanticSimpleIconActions = null;
		this._aSemanticTextActions = null;
		this._aCustomTextActions = null;
		this._aCustomIconActions = null;
		this._aSemanticNavIconActions = null;

		return SemanticContainer.prototype.destroy.call(this);
	};

	/*
	* CUSTOM TEXT ACTIONS
	*/
	SemanticTitle.prototype.addCustomTextAction = function(oCustomControl) {
		oCustomControl.setType(ButtonType.Transparent);
		this._callContainerAggregationMethod("insertAction", oCustomControl, this._getCustomTextActionInsertIndex());
		this._aCustomTextActions.push(oCustomControl);
		return this;
	};

	SemanticTitle.prototype.insertCustomTextAction = function(oCustomControl, iIndex) {
		oCustomControl.setType(ButtonType.Transparent);
		this._callContainerAggregationMethod("insertAction", oCustomControl, this._getCustomTextActionInsertIndex(iIndex));
		this._aCustomTextActions.splice(iIndex, 0, oCustomControl);
		return this;
	};

	SemanticTitle.prototype.indexOfCustomTextAction = function(oCustomControl) {
		return this._aCustomTextActions.indexOf(oCustomControl);
	};

	SemanticTitle.prototype.removeCustomTextAction = function(oCustomControl) {
		var iIndex = this._aCustomTextActions.indexOf(oCustomControl),
			vResult = this._callContainerAggregationMethod("removeAction", oCustomControl);
		this._aCustomTextActions.splice(iIndex, 1);
		return vResult;
	};

	SemanticTitle.prototype.removeAllCustomTextActions = function() {
		var aResult = [];

		this._aCustomTextActions.forEach(function(oCustomControl){
			var vResult = this._callContainerAggregationMethod("removeAction", oCustomControl);
			if (vResult) {
				aResult.push(oCustomControl);
			}
		}, this);

		this._aCustomTextActions = [];
		return aResult;
	};

	SemanticTitle.prototype.destroyCustomTextActions = function() {
		this.removeAllCustomTextActions().forEach(
			function(oCustomControl){
				oCustomControl.destroy();
			});

		return this;
	};

	SemanticTitle.prototype.getCustomTextActions = function() {
		return this._aCustomTextActions;
	};

	/*
	* CUSTOM ICON ACTIONS
	*/
	SemanticTitle.prototype.addCustomIconAction = function(oCustomControl) {
		oCustomControl.setType(ButtonType.Transparent);
		this._callContainerAggregationMethod("insertAction", oCustomControl, this._getCustomIconActionInsertIndex());
		this._aCustomIconActions.push(oCustomControl);
		return this;
	};

	SemanticTitle.prototype.insertCustomIconAction = function(oCustomControl, iIndex) {
		oCustomControl.setType(ButtonType.Transparent);
		this._callContainerAggregationMethod("insertAction", oCustomControl, this._getCustomIconActionInsertIndex(iIndex));
		this._aCustomIconActions.splice(iIndex, 0, oCustomControl);
		return this;
	};

	SemanticTitle.prototype.indexOfCustomIconAction = function(oCustomControl) {
		return this._aCustomIconActions.indexOf(oCustomControl);
	};

	SemanticTitle.prototype.removeCustomIconAction = function(oCustomControl) {
		var iIndex = this._aCustomIconActions.indexOf(oCustomControl),
			vResult = this._callContainerAggregationMethod("removeAction", oCustomControl);
		this._aCustomIconActions.splice(iIndex, 1);
		return vResult;
	};

	SemanticTitle.prototype.removeAllCustomIconActions = function() {
		var aResult = [];

		this._aCustomIconActions.forEach(function(oCustomControl){
			var vResult = this._callContainerAggregationMethod("removeAction", oCustomControl);
			if (vResult) {
				aResult.push(oCustomControl);
			}
		}, this);

		this._aCustomIconActions = [];
		return aResult;
	};

	SemanticTitle.prototype.destroyCustomIconActions = function() {
		this.removeAllCustomIconActions().forEach(function(oCustomControl){oCustomControl.destroy();});
		return this;
	};

	SemanticTitle.prototype.getCustomIconActions = function() {
		return this._aCustomIconActions;
	};


	/*
	* PRIVATE METHODS
	*/

	/*
	* SEMANTIC ACTIONS
	*/

	/*
	* Inserts the <code>sap.f.semantic.SemanticControl</code> in the <code>titleText</code> area.
	*
	* @private
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticTitle}
	*/
	SemanticTitle.prototype._insertSemanticTextContent = function(oSemanticControl) {
		var oControl = this._getControl(oSemanticControl),
			bIsMainAction = this._isMainAction(oSemanticControl),
			iInsertIndex;

		this._aSemanticTextActions.push(oSemanticControl);

		if (bIsMainAction) {
			this._iMainActionCount ++;
			iInsertIndex = this._getSemanticTextMainActionInsertIndex();
		} else {
			iInsertIndex = this._getSemanticTextActionInsertIndex(oSemanticControl);
		}

		this._callContainerAggregationMethod("insertAction", oControl, iInsertIndex);
		return this;
	};

	/*
	* Removes the <code>sap.f.semantic.SemanticControl</code> from the <code>titleText</code> area.
	*
	* @private
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticTitle}
	*/
	SemanticTitle.prototype._removeSemanticTextContent = function(oSemanticControl) {
		var oControl = this._getControl(oSemanticControl),
			iControlIndex = this._aSemanticTextActions.indexOf(oSemanticControl),
			bIsMainAction = this._isMainAction(oSemanticControl);

		if (bIsMainAction) {
			this._iMainActionCount --;
		}

		this._aSemanticTextActions.splice(iControlIndex, 1);
		this._callContainerAggregationMethod("removeAction", oControl);
		return this;
	};

	/*
	* Inserts the <code>sap.f.semantic.SemanticControl</code> in the <code>titleIcon</code> area.
	*
	* @private
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticTitle}
	*/
	SemanticTitle.prototype._insertSemanticIconContent = function(oSemanticControl) {
		var oControl = this._getControl(oSemanticControl),
			sContainerAggregationMethod,
			iInsertIndex;

		if (this._isNavigationAction(oSemanticControl)) {
			this._aSemanticNavIconActions.push(oSemanticControl);
			iInsertIndex = this._getSemanticNavIconActionInsertIndex(oSemanticControl);
			sContainerAggregationMethod = "insertNavigationAction";
		} else {
			this._aSemanticSimpleIconActions.push(oSemanticControl);
			iInsertIndex = this._getSemanticSimpleIconActionInsertIndex(oSemanticControl);
			sContainerAggregationMethod = "insertAction";
		}

		this._callContainerAggregationMethod(sContainerAggregationMethod, oControl, iInsertIndex);
		return this;
	};

	/*
	* Removes the <code>sap.f.semantic.SemanticControl</code> from the <code>titleIcon</code> area.
	*
	* @private
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticTitle}
	*/
	SemanticTitle.prototype._removeSemanticIconContent = function(oSemanticControl) {
		var oControl = this._getControl(oSemanticControl),
			sContainerAggregationMethod,
			iControlIndex;

		if (this._isNavigationAction(oSemanticControl)) {
			iControlIndex = this._aSemanticNavIconActions.indexOf(oSemanticControl);
			this._aSemanticNavIconActions.splice(iControlIndex, 1);
			sContainerAggregationMethod = "removeNavigationAction";
		} else {
			iControlIndex = this._aSemanticTextActions.indexOf(oSemanticControl);
			this._aSemanticSimpleIconActions.splice(iControlIndex, 1);
			sContainerAggregationMethod = "removeAction";
		}

		this._callContainerAggregationMethod(sContainerAggregationMethod, oControl);
		return this;
	};

	/*
	* Inserts the <code>sap.f.semantic.SemanticControl</code> in the <code>shareIcon</code> area.
	*
	* @private
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticTitle}
	*/
	SemanticTitle.prototype._insertSemanticShareContent = function(oSemanticControl) {
		var oControl = this._getControl(oSemanticControl),
			iInsertIndex = this._getSemanticShareMenuInsertIndex();

		this._callContainerAggregationMethod("insertAction", oControl, iInsertIndex);
		return this;
	};

	/*
	* Removes the <code>sap.f.semantic.SemanticControl</code> from the <code>shareIcon</code> area.
	*
	* @private
	* @param {sap.f.semantic.SemanticControl} oSemanticControl
	* @returns {sap.f.semantic.SemanticTitle}
	*/
	SemanticTitle.prototype._removeSemanticShareContent = function(oSemanticControl) {
		var oControl = this._getControl(oSemanticControl);
		this._callContainerAggregationMethod("removeAction", oControl);
		return this;
	};

	/*
	* Determines the insert index of the <code>sap.f.semantic.MainAction</code>,
	* that is about to be added in the <code>titleText</code> area.
	*
	* <b>Note:</b> The <code>MainAction</code> should always be the first title action,
	* based on the semantic order requirements and it is defined in <code>SemanticConfiguration</code> as well.
	*
	* @private
	* @returns {Number}
	*/
	SemanticTitle.prototype._getSemanticTextMainActionInsertIndex = function() {
		return 0;
	};

	/*
	* Determines the insert index of the custom text action
	* that is about to be added in the <code>titleText</code> area.
	*
	* <b>Note:</b> The custom text actions should be inserted right after the <code>MainAction</code>,
	* based on the semantic order requirements, that`s why the resulting index
	* considers the presence of the <code>MainAction</code>.
	*
	* @private
	* @param {iIndex}
	* @returns {Number}
	*/
	SemanticTitle.prototype._getCustomTextActionInsertIndex = function(iIndex) {
		var iCustomTextActionsCount = this._aCustomTextActions.length;

		if (iIndex === undefined) {
			return this._iMainActionCount + iCustomTextActionsCount;
		}

		iIndex = iIndex >= iCustomTextActionsCount ? iCustomTextActionsCount : iIndex;
		iIndex += this._iMainActionCount;
		return iIndex;
	};

	/*
	* Determines the insert index of the <code>sap.f.semantic.SemanticControl</code>,
	* that is about to be added in the <code>titleText</code> area.
	*
	* <ul><b>Notes:</b>
	* <li>The semantic text actions should be inserted right after the custom text ones,
	* based on the semantic order requirements. Furthermore, the order between the semantic
	* text actions is defined in the <code>SemanticConfiguration</code>.</li>	*
	* <li>The resulting index is subtracted with the count of <code>MainAction</code>
	* as the <code>MainAction</code> is part of the private <code>_aSemanticTextActions</code> array.</li></ul>
	*
	* @private
	* @param {sap.f.semantic.SemanticControl}
	* @returns {Number}
	*/
	SemanticTitle.prototype._getSemanticTextActionInsertIndex = function(oSemanticControl) {
		this._aSemanticTextActions.sort(this._sortControlByOrder.bind(this));
		return this._getCustomTextActionInsertIndex()
			+ this._aSemanticTextActions.indexOf(oSemanticControl)
			- this._iMainActionCount;
	};

	/*
	* Determines the insert index of the custom icon action
	* that is about to be added in the <code>titleIcon</code> area.
	*
	* <b>Note:</b> The custom icon actions should be inserted right after the semantic text actions,
	* based on the semantic order requirements.
	*
	* @private
	* @param {iIndex}
	* @returns {Number}
	*/
	SemanticTitle.prototype._getCustomIconActionInsertIndex = function(iIndex) {
		var iCustomIconsCount = this._aCustomIconActions.length,
			iPriorActionsCount = this._aCustomTextActions.length + this._aSemanticTextActions.length;

		if (iIndex === undefined) {
			return iPriorActionsCount + iCustomIconsCount;
		}

		iIndex = iIndex >= iCustomIconsCount ? iCustomIconsCount : iIndex;
		iIndex += iPriorActionsCount;
		return iIndex;
	};

	/*
	* Determines the insert index of the <code>sap.f.semantic.SemanticControl</code>,
	* that is about to be added in the <code>titleIcon</code> area with constraint <code>IconOnly</code>,
	* defined in <code>SemanticConfiguration</code>.
	*
	* <b>Note:</b> The semantic icon actions should be inserted right after the custom icon actions,
	* based on the semantic order requirements. Furthermore, the order between the semantic
	* icon actions is defined in the <code>SemanticConfiguration</code>.
	*
	* @private
	* @param {sap.f.semantic.SemanticControl}
	* @returns {Number}
	*/
	SemanticTitle.prototype._getSemanticSimpleIconActionInsertIndex = function(oSemanticControl) {
		this._aSemanticSimpleIconActions.sort(this._sortControlByOrder.bind(this));
		return this._getCustomIconActionInsertIndex() + this._aSemanticSimpleIconActions.indexOf(oSemanticControl);
	};

	/*
	* Determines the insert index of the <code>sap.f.semantic.SemanticControl</code>,
	* that is about to be added in the <code>titleIcon</code> area with <code>navigation=true</code>,
	* defined in <code>SemanticConfiguration</code>.
	*
	* @private
	* @param {sap.f.semantic.SemanticControl}
	* @returns {Number}
	*/
	SemanticTitle.prototype._getSemanticNavIconActionInsertIndex = function(oSemanticControl) {
		this._aSemanticNavIconActions.sort(this._sortControlByOrder.bind(this));
		return this._aSemanticNavIconActions.indexOf(oSemanticControl);
	};

	/*
	* Determines the insert index of the <code>sap.f.semantic.SemanticControl</code>,
	* that is about to be added in the <code>titleIcon</code> area with constraint <code>shareIcon</code>.
	*
	* @private
	* @returns {Number}
	*/
	SemanticTitle.prototype._getSemanticShareMenuInsertIndex = function() {
		return this._callContainerAggregationMethod("getActions").length;
	};

	/**
	* Retrieves the container`s internal aggregation.
	*
	* @returns {sap.m.OverflowToolbar | null}
	* @private
	*/
	SemanticTitle.prototype._getContainerBar = function () {
		var oContainer = this._getContainer();

		if (oContainer) {
			return oContainer.getAggregation("_overflowToolbar");
		}

		return null;
	};

	return SemanticTitle;

});