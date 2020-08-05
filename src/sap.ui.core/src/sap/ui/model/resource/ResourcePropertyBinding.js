/*!
 * ${copyright}
 */

// Provides the resource model implementation of a property binding
sap.ui.define(['sap/ui/model/PropertyBinding', 'sap/ui/model/ChangeReason'],
	function(PropertyBinding, ChangeReason) {
	"use strict";

	/**
	 * Do <strong>NOT</strong> call this private constructor, but rather use
	 * {@link sap.ui.model.resource.ResourceModel#bindProperty} instead! Only <code>oModel</code>
	 * and <code>sPath</code> are used, other constructor parameters from parent classes are not
	 * supported.
	 *
	 * @param {sap.ui.model.resource.ResourceModel} oModel
	 *   The resource model instance
	 * @param {string} sPath
	 *   The binding path in the model
	 *
	 * @alias sap.ui.model.resource.ResourcePropertyBinding
	 * @author SAP SE
	 * @class Property binding implementation for the resource bundle model.
	 * @extends sap.ui.model.PropertyBinding
	 * @private
	 */
	var ResourcePropertyBinding = PropertyBinding.extend("sap.ui.model.resource.ResourcePropertyBinding", /** @lends sap.ui.model.resource.ResourcePropertyBinding.prototype */ {

			constructor : function (oModel, sPath) {
				PropertyBinding.apply(this, arguments);

				this.oValue = this.oModel.getProperty(sPath);
			}
		});

	/**
	 * Returns the current value.
	 *
	 * @returns {string}
	 *   The current value
	 *
	 * @private
	 * @see sap.ui.model.PropertyBinding#getValue
	 */
	ResourcePropertyBinding.prototype.getValue = function () {
		return this.oValue;
	};

	/**
	 * Checks whether an update of this bindings is required. If the binding is not suspended, it
	 * fires a change event if either the value has changed or bForceUpdate is <code>true</code>.
	 *
	 * @param {boolean} bForceUpdate
	 *   Whether to fire a change event even if the value did not change
	 *
	 * @private
	 * @see sap.ui.model.Binding#checkUpdate
	 */
	ResourcePropertyBinding.prototype.checkUpdate = function (bForceUpdate) {
		if (!this.bSuspended) {
			var oValue = this.oModel.getProperty(this.sPath);
			if (bForceUpdate || oValue != this.oValue) {
				this.oValue = oValue;
				this._fireChange({reason: ChangeReason.Change});
			}
		}
	};

	return ResourcePropertyBinding;
});
