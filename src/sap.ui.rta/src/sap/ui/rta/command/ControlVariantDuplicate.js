/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Utils"
], function(
	BaseCommand,
	JsControlTreeModifier,
	flUtils
) {
	"use strict";

	/**
	 * Switch control variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.52
	 * @alias sap.ui.rta.command.ControlVariantDuplicate
	 */
	var ControlVariantDuplicate = BaseCommand.extend("sap.ui.rta.command.ControlVariantDuplicate", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				sourceVariantReference : {
					type : "string"
				},
				newVariantReference : {
					type : "string"
				},
				newVariantTitle : {
					type : "string"
				}
			},
			associations : {},
			events : {}
		}
	});

	/**
	 * @override
	 */
	ControlVariantDuplicate.prototype.prepare = function(mFlexSettings) {
		this.sLayer = mFlexSettings.layer;
		return true;
	};

	ControlVariantDuplicate.prototype.getPreparedChange = function() {
		if (!this._aPreparedChanges) {
			return undefined;
		}
		return this._aPreparedChanges;
	};

	/**
	 * Triggers the duplication of a variant.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	ControlVariantDuplicate.prototype.execute = function() {
		var oVariantManagementControl = this.getElement();
		var sSourceVariantReference = this.getSourceVariantReference();
		var sNewVariantReference = this.getNewVariantReference();
		this.oAppComponent = flUtils.getAppComponentForControl(oVariantManagementControl);

		if (!sNewVariantReference) {
			sNewVariantReference = flUtils.createDefaultFileName();
			this.setNewVariantReference(sNewVariantReference);
		}

		this.sVariantManagementReference = JsControlTreeModifier.getSelector(oVariantManagementControl, this.oAppComponent).id;
		this.oModel = this.oAppComponent.getModel(flUtils.VARIANT_MODEL_NAME);

		var mPropertyBag = {
			variantManagementReference : this.sVariantManagementReference,
			appComponent : this.oAppComponent,
			layer : this.sLayer,
			newVariantReference : sNewVariantReference,
			sourceVariantReference : sSourceVariantReference,
			title: this.getNewVariantTitle()
		};

		return this.oModel.copyVariant(mPropertyBag)
			.then(function(aChanges) {
				this._oVariantChange = aChanges[0];
				this._aPreparedChanges = aChanges;
			}.bind(this));
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantDuplicate.prototype.undo = function() {
		if (this._oVariantChange) {
			var mPropertyBag = {
				variant: this._oVariantChange,
				sourceVariantReference: this.getSourceVariantReference(),
				variantManagementReference: this.sVariantManagementReference,
				component: this.oAppComponent
			};
			return this.oModel.removeVariant(mPropertyBag)
				.then(function() {
					this._oVariantChange = null;
					this._aPreparedChanges = null;
				}.bind(this));
		}
		return Promise.resolve();
	};

	return ControlVariantDuplicate;
});
