/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/Object", "sap/ui/core/mvc/XMLView"], function (BaseObject, View) {
	"use strict";
	/**
	 * Constructor for a new <code>BaseMediator</code>.
	 *
	 *
	 * @param {object} [mSettings] Initial settings for the new control
     * @param {sap.ui.core.Control} mSettings.control The control instance that is personalized by this mediator
     * @param {string} mSettings.targetAggregation The name of the aggregation that is now managed by this mediator
     * @param {string} mSettings.p13nMetadataTarget The name of the personalization metadata target that is now managed by this mediator
	 * @class
	 * The <code>BaseMediator</code> entity serves as a base class to create control-specific personalization implementations.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @experimental since 1.120
	 * @since 1.120
	 * @alias sap.m.upload.p13n.mediator.BaseMediator
	 */

	const BaseMediator = BaseObject.extend("sap.m.upload.p13n.mediator.BaseMediator", {
		constructor: function (mSettings) {
			BaseObject.call(this);
			if (!mSettings?.control) {
				throw Error('Please provide "control" for personalization');
			}
			this._oControl = mSettings.control;
			if (!mSettings?.targetAggregation) {
				throw Error('Please provide "targetAggregation" for personalization');
			}
			this._sTargetAggregation = mSettings.targetAggregation;
			if (!mSettings?.p13nMetadataTarget) {
				throw Error('Please provide "p13nMetadataTarget" for personalization');
			}
			this._sP13nMetadataTarget = mSettings.p13nMetadataTarget;
		}
	});

	/**
	 *
	 * Returns the control instance that has been set
	 * @returns {sap.m.upload.UploadSetwithTable} returns the upload set table control
	 * @public
	 */
	BaseMediator.prototype.getControl = function () {
		return this._oControl;
	};

	/**
	 *
	 * Returns the target aggregation that has been set
	 * @returns {string} returns the target aggregation
	 */

	BaseMediator.prototype.getTargetAggregation = function () {
		return this._sTargetAggregation;
	};


	/**
	 *
	 * Returns the target metadata that as been set
	 * @returns {string} returns the p13 target metadata
	 */

	BaseMediator.prototype.getP13nMetadataTarget = function () {
		return this._sP13nMetadataTarget;
	};

	/**
	 *
	 * Abstract method for constructing a panel and populating it with data specific to that panel.
	 *
	 * @name sap.m.upload.p13n.mediator.BaseMediator.prototype.createPanel
	 * @function
	 * @protected
	 * @returns {Promise} returns a promise with the resolved p13 panel.
	 *
	 */

	/**
	 *
	 * Abstract method to obtain changes by comparing the old and current states.
	 *
	 * @name sap.m.upload.p13n.mediator.BaseMediator.prototype.getChanges
	 * @function
	 * @protected
	 * @returns {Array} returns array of delta changes
	 *
	 */

	/**
	 *
	 *
 	 * An abstract method for applying changes to the upload set table.
 	 * Essentially, these changes should be applied after the current data becomes available.
	 *
	 * @name sap.m.upload.p13n.mediator.BaseMediator.prototype.applyStateToTable
	 * @function
	 * @protected
	 *
	 */


	/**
	 *
	 * Gets the view for the particular control
	 * @returns {object} returns the view object
	 * @public
	 *
	 */

	BaseMediator.prototype.getView = function () {
		return this.getControlOfType(this.getControl(), View);
	};

	/**
	 * Helper method to get control view
	 * @private
	 */

	BaseMediator.prototype.getControlOfType = function (oControl, oType) {
		if (oControl instanceof oType) {
			return oControl;
		}
		if (oControl && typeof oControl[false]) {
			return this.getControlOfType(oControl.getParent(), oType);
		}
		return undefined;
	};

	/**
	 *
	 * Converts the array of objects with key properties to map and adds addIndex
	 * @param {Array} aArray expects array of objects with key property
	 * @param {boolean} addIndex expects a boolean in case index needs to be added
	 * @returns {object} returns the converted object with key as value of key property inside the object
	 * @internal
	 *
	 */

	BaseMediator.prototype.arrayToMap = function (aArray, addIndex = false) {
		return aArray.reduce(function (mMap, oProp, iIndex) {
			mMap[oProp.key] = oProp;
			if (addIndex) {
				mMap[oProp.key].index = iIndex;
			}
			return mMap;
		}, {});
	};

	/**
	 *
	 * Creates a change that can later be handeled by the flexibility layer to apply and revert the change.
	 * @param {string} sChangeType expects the name of change which will be later handled in change handlers.
	 * @param {*} oContent expects the changed content which is delta for the specific panel.
	 * @returns {object} returns the change object.
	 * @public
	 */

	BaseMediator.prototype.createChange = function (sChangeType, oContent) {
		oContent.targetAggregation = this.getTargetAggregation();
		return {
			selectorElement: this.getControl(),
			changeSpecificData: {
				changeType: sChangeType,
				content: oContent
			}
		};
	};

	return BaseMediator;
});
