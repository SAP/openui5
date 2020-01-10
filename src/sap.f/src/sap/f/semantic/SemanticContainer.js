/*!
 * ${copyright}
 */

/**
* Provides a private class <code>sap.f.semantic.SemanticContainer</code>.
*/
sap.ui.define([
	"sap/ui/base/Metadata",
	"./SemanticConfiguration",
	"sap/base/Log"
], function(Metadata, SemanticConfiguration, Log) {
	"use strict";

	/**
	* Constructor for a <code>sap.f.semantic.SemanticContainer</code>.
	*
	* The base class for the <code>sap.f.semantic.SemanticTitle</code> and  <code>sap.f.semantic.SemanticFooter</code>.
	*
	* @private
	* @since 1.46.0
	* @alias sap.f.semantic.SemanticContainer
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var SemanticContainer = Metadata.createClass("sap.f.semantic.SemanticContainer", {
		constructor : function(oContainer, oParent) {
			if (!oContainer) {
				Log.error("SemanticContainer :: missing argument - container reference", this);
				return;
			}

			this._oContainer = oContainer;
			this._oParent = oParent;
		}
	});

	/**
	* Returns the container control, used to hold ui5 controls.
	*
	* @returns {sap.ui.core.Control}
	*/
	SemanticContainer.prototype._getContainer = function() {
		return this._oContainer;
	};

	/**
	 * Returns the parent control.
	 *
	 * @returns {sap.ui.core.Control}
	 */
	SemanticContainer.prototype._getParent = function() {
		return this._oParent;
	};

	/**
	 * Returns the shouldBePreprocessed state of a <code>SemanticControl</code>,
	 * defined in <code>sap.f.semantic.SemanticConfiguration</code>.
	 *
	 * @param {sap.f.semantic.SemanticControl} oControl
	 * @returns {Boolean}
	 */
	SemanticContainer.prototype._shouldBePreprocessed = function(oControl) {
		var sType = (oControl._getType && oControl._getType()) || oControl.getMetadata().getName();

		return SemanticConfiguration.shouldBePreprocessed(sType);
	};

	/**
	* Returns the order of a <code>SemanticControl</code> instance,
	* defined in <code>sap.f.semantic.SemanticConfiguration</code>.
	*
	* @param {sap.f.semantic.SemanticControl} oControl
	* @returns {String}
	*/
	SemanticContainer.prototype._getControlOrder = function(oControl) {
		var sType = (oControl._getType && oControl._getType()) || oControl.getMetadata().getName();

		return SemanticConfiguration.getOrder(sType);
	};

	/**
	* Returns the constraint of a <code>SemanticControl</code> instance,
	* defined in <code>sap.f.semantic.SemanticConfiguration</code>.
	* The constraints might be <code>IconOnly</code> and <code>Navigation</code>.
	*
	* @param {sap.f.semantic.SemanticControl | sap.m.Button} oControl
	* @returns {String}
	*/
	SemanticContainer.prototype._getConstraints = function(oControl) {
		return SemanticConfiguration.getConstraints(oControl.getMetadata().getName());
	};

	/**
	* Returns the internal control of a <code>SemanticControl</code> instance.
	*
	* <b>Note:</b> If the method is applied on a non-semantic control,
	* the method will return the non-semantic control itself.
	*
	* @param {sap.f.semantic.SemanticControl | sap.m.Button} oControl
	* @returns {sap.f.semantic.SemanticControl | sap.m.Button}
	*/
	SemanticContainer.prototype._getControl = function(oControl) {
		return oControl._getControl ? oControl._getControl() : oControl;
	};

	/**
	* Determines if the <code>SemanticControl</code> is a <code>sap.f.semantic.MainAction</code>.
	*
	* @returns {Boolean}
	*/
	SemanticContainer.prototype._isMainAction = function(oControl) {
		return SemanticConfiguration.isMainAction(oControl.getMetadata().getName());
	};

	/**
	* Determines if the <code>SemanticControl</code> is a <code>Navigation</code> action,
	* such as  <code>sap.f.semantic.FullScreenAction</code> and <code>sap.f.semantic.CloseAction</code>.
	*
	* @returns {Boolean}
	*/
	SemanticContainer.prototype._isNavigationAction = function(oControl) {
		return SemanticConfiguration.isNavigationAction(oControl.getMetadata().getName());
	};

	/**
	* Calls container`s method.
	*
	* @param {String} sMethod the method to be called
	* @returns {Object | Array<T>}
	*/
	SemanticContainer.prototype._callContainerAggregationMethod = function(sMethod) {
		return this._getContainer()[sMethod].apply(this._getContainer(), Array.prototype.slice.call(arguments).slice(1));
	};

	/**
	* Sorts the <code>SemanticControl</code> instances by the order
	* defined in the <code>sap.f.semantic.SemanticConfiguration</code>.
	*
	* @param {String} oControlA
	* @param {String} oControlB
	* @returns {Number}
	*/
	SemanticContainer.prototype._sortControlByOrder = function(oControlA, oControlB) {
		return this._getControlOrder(oControlA) - this._getControlOrder(oControlB);
	};

	SemanticContainer.prototype.destroy = function() {
		this._oParent = null;
		this._oContainer = null;
	};

	return SemanticContainer;

});