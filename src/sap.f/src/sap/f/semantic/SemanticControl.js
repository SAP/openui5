/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"./SemanticConfiguration"
], function (jQuery, ManagedObject, Element, SemanticConfiguration) {
	"use strict";

	/**
	* Constructor for a new <code>SemanticControl</code>.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Initial settings for the new control
	*
	* @class
	* The base class for the {@link sap.f.semantic.SemanticButton}.
	*
	* @extends sap.ui.core.Element
	* @abstract
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.SemanticControl
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var SemanticControl = Element.extend("sap.f.semantic.SemanticControl", /** @lends sap.f.semantic.SemanticControl.prototype */ {
		metadata: {
			library: "sap.f",
			"abstract": true,

			properties: {

				/**
				* Determines whether the <code>SemanticControl</code> is visible.
				*/
				visible: {type: "boolean", group: "Appearance", defaultValue: true}
			},

			aggregations: {

				/**
				* Hidden aggregation.
				*/
				_control: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
			}
		}
	});

	SemanticControl.prototype.setProperty = function (key, value, bSuppressInvalidate) {
		ManagedObject.prototype.setProperty.call(this, key, value, true);
		this._applyProperty(key, value, bSuppressInvalidate);

		return this;
	};

	SemanticControl.prototype.updateAggregation = function (sName) {
		this._getControl().updateAggregation(sName);
	};

	SemanticControl.prototype.refreshAggregation = function (sName) {
		this._getControl().refreshAggregation(sName);
	};

	SemanticControl.prototype.setAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		if (sAggregationName === '_control') {
			return ManagedObject.prototype.setAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		}
		return this._getControl().setAggregation(sAggregationName, oObject, bSuppressInvalidate);
	};

	SemanticControl.prototype.getAggregation = function (sAggregationName, oDefaultForCreation) {
		if (sAggregationName === '_control') {
			return ManagedObject.prototype.getAggregation.call(this, sAggregationName, oDefaultForCreation);
		}
		return this._getControl().getAggregation(sAggregationName, oDefaultForCreation);
	};

	SemanticControl.prototype.indexOfAggregation = function (sAggregationName, oObject) {
		return this._getControl().indexOfAggregation(sAggregationName, oObject);
	};

	SemanticControl.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		return this._getControl().insertAggregation(sAggregationName, oObject, iIndex, bSuppressInvalidate);
	};

	SemanticControl.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		return this._getControl().addAggregation(sAggregationName, oObject, bSuppressInvalidate);
	};

	SemanticControl.prototype.removeAggregation = function (sAggregationName, vObject, bSuppressInvalidate) {
		return this._getControl().removeAggregation(sAggregationName, vObject, bSuppressInvalidate);
	};

	SemanticControl.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
		return this._getControl().removeAllAggregation(sAggregationName, bSuppressInvalidate);
	};

	SemanticControl.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		return this._getControl().destroyAggregation(sAggregationName, bSuppressInvalidate);
	};

	SemanticControl.prototype.bindAggregation = function (sName, oBindingInfo) {
		return this._getControl().bindAggregation(sName, oBindingInfo);
	};

	SemanticControl.prototype.unbindAggregation = function (sName, bSuppressReset) {
		return this._getControl().unbindAggregation(sName, bSuppressReset);
	};

	SemanticControl.prototype.clone = function (sIdSuffix, aLocalIds) {
		var oClone = Element.prototype.clone.apply(this, arguments);

		// need to clone the private oControl as well
		var oPrivateControlClone = this._getControl().clone(sIdSuffix, aLocalIds);

		oClone.setAggregation('_control', oPrivateControlClone);
		return oClone;
	};

	SemanticControl.prototype.destroy = function () {
		var vResult = Element.prototype.destroy.apply(this, arguments);
		if (this.getAggregation("_control")) {
			this.getAggregation("_control").destroy();
		}
		return vResult;
	};

	SemanticControl.prototype.getDomRef = function(sSuffix) {
		return this._getControl().getDomRef(sSuffix);
	};

	SemanticControl.prototype.addEventDelegate = function (oDelegate, oThis) {
		jQuery.each(oDelegate, function(sEventType, fnCallback) {
			if (typeof fnCallback === 'function') {
				/* replace oEvent.srcControl with the semantic control to prevent exposing the inner control */
				oDelegate[sEventType] = function (oEvent) {
					oEvent.srcControl = this;
					fnCallback.call(oThis, oEvent);
				}.bind(this);
			}
		}.bind(this));

		this._getControl().addEventDelegate(oDelegate, oThis);

		return this;
	};

	SemanticControl.prototype.removeEventDelegate = function (oDelegate) {
		this._getControl().removeEventDelegate(oDelegate);
		return this;
	};

	SemanticControl.prototype._getConfiguration = function () {
		return SemanticConfiguration.getConfiguration(this.getMetadata().getName());
	};

	/**
	* Applies the property value according to the semantic logic.
	* @private
	*/
	SemanticControl.prototype._applyProperty = function(key, value, bSuppressInvalidate) {
		var oControl = this._getControl(), sSetter;

		if (oControl) {
			sSetter = "set" + capitalize(key);
			this._getControl()[sSetter](value, bSuppressInvalidate);
		}
	};

	function capitalize(sName) {
		return sName.charAt(0).toUpperCase() + sName.slice(1);
	}

	return SemanticControl;

});
