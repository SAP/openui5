/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/semantic/SemanticConfiguration",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery"
], function(SemanticConfiguration, ManagedObject, Element, jQuery) {
	"use strict";

	/**
	 * Constructor for a new SemanticControl.
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A semantic control is an abstraction for either a {@link sap.m.semantic.SemanticButton} or {@link sap.m.semantic.SemanticSelect} ,
	 * eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * @extends sap.ui.core.Element
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.SemanticControl
	 */
	var SemanticControl = Element.extend("sap.m.semantic.SemanticControl", /** @lends sap.m.semantic.SemanticControl.prototype */ {
		metadata: {

			library: "sap.m",

			"abstract": true,

			properties: {
				/**
				 * See {@link sap.ui.core.Control#visible}
				 */
				visible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				}
			},

			aggregations: {

				/**
				 * The internal control instance, that is abstracted by the semantic control.
				 * Can be {@link sap.m.Button}, {@link sap.m.semantic.SemanticOverflowToolbarButton} or {@link sap.m.Select}
				 */
				_control: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
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

	/**
	 * Implementation of a commonly used function that adapts <code>sap.ui.core.Element</code>
	 * to provide DOM reference for opening popovers.
	 * @returns {Element} The DOM reference of the actual wrapped control
	 * @public
	 */
	SemanticControl.prototype.getPopupAnchorDomRef = function() {
		return this._getControl().getDomRef();
	};

	SemanticControl.prototype.getDomRef = function(sSuffix) {
		return this._getControl().getDomRef(sSuffix);
	};

	SemanticControl.prototype.addEventDelegate = function (oDelegate, oThis) {

		jQuery.each(oDelegate, function(sEventType, fnCallback) {

			if (typeof fnCallback === 'function') {

				/* replace oEvent.srcControl with the semantic control
				to prevent exposing the inner control */
				var fnProxy = function(oEvent) {
					oEvent.srcControl = this;
					fnCallback.call(oThis, oEvent);
				}.bind(this);

				oDelegate[sEventType] = fnProxy;
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

	SemanticControl.prototype._onPageStateChanged = function (oEvent) {
		this._updateState(oEvent.sId);
	};

	SemanticControl.prototype._updateState = function (oStateName) {

		if (this._getConfiguration() && this._getControl()) {
			var oSettings = this._getConfiguration().states[oStateName];
			if (oSettings) {
				this._getControl().applySettings(oSettings);
			}
		}
	};

	/**
	 * Applies the property value according to semantic logic
	 * @private
	 */
	SemanticControl.prototype._applyProperty = function(key, value, bSuppressInvalidate) {
		var sSetter = "set" + this._capitalize(key); //we call the setter, rather than setProperty on the control,
													// to make sure we cover the case when the control has
													// overwritten the setter with custom implementation
		this._getControl()[sSetter](value, bSuppressInvalidate);
	};

	SemanticControl.prototype._capitalize = function(sName) {
		return sName.charAt(0).toUpperCase() + sName.slice(1);
	};

	return SemanticControl;
});