/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/library",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/Utils"
], function(
	BaseCommand,
	rtaLibrary,
	JsControlTreeModifier,
	ControlVariantApplyAPI,
	flUtils
) {
	"use strict";

	/**
	 * Configure control variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.52
	 * @alias sap.ui.rta.command.ControlVariantConfigure
	 */
	var ControlVariantConfigure = BaseCommand.extend("sap.ui.rta.command.ControlVariantConfigure", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				control: {
					type: "any"
				},
				changes: {
					type: "array"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	ControlVariantConfigure.prototype.prepare = function(mFlexSettings) {
		this.sLayer = mFlexSettings.layer;
		return true;
	};

	ControlVariantConfigure.prototype.getPreparedChange = function() {
		if (!this._aPreparedChanges) {
			return undefined;
		}
		return this._aPreparedChanges;
	};

	/**
	 * Triggers the configuration of a variant.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	ControlVariantConfigure.prototype.execute = async function() {
		var oVariantManagementControl = this.getControl();
		this.oAppComponent = flUtils.getAppComponentForControl(oVariantManagementControl);
		this.oModel = this.oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
		this.sVariantManagementReference = JsControlTreeModifier.getSelector(oVariantManagementControl, this.oAppComponent).id;

		this._aPreparedChanges = [];
		if (this.getChanges().some((oChange) => {
			if (
				oChange.visible === false
				&& oChange.variantReference === this.oModel.getCurrentVariantReference(this.sVariantManagementReference)
			) {
				this._sOldVReference = oChange.variantReference;
				return true;
			}
			return false;
		})) {
			await this.oModel.updateCurrentVariant({
				variantManagementReference: this.sVariantManagementReference,
				newVariantReference: this.sVariantManagementReference
			});
		}

		this.getChanges().forEach(function(mChangeProperties) {
			mChangeProperties.appComponent = this.oAppComponent;
			mChangeProperties.generator = rtaLibrary.GENERATOR_NAME;
			this._aPreparedChanges.push(this.oModel.addVariantChange(this.sVariantManagementReference, mChangeProperties));
		}.bind(this));

		return Promise.resolve();
	};

	/**
	 * Undo logic for the execution.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantConfigure.prototype.undo = function() {
		var mPropertyBag;
		this.getChanges().forEach(function(mChangeProperties, index) {
			mPropertyBag = {};
			Object.keys(mChangeProperties).forEach(function(sProperty) {
				var sOriginalProperty = "original" + sProperty.charAt(0).toUpperCase() + sProperty.substr(1);
				if (sProperty === "visible") {
					mPropertyBag[sProperty] = true; /* visibility of the variant always set back to true on undo */
				} else if (mChangeProperties[sOriginalProperty]) {
					mPropertyBag[sProperty] = mChangeProperties[sOriginalProperty];
					mPropertyBag[sOriginalProperty] = mChangeProperties[sProperty];
				} else if (sProperty.indexOf("original") === -1) {
					mPropertyBag[sProperty] = mChangeProperties[sProperty];
				}
			});
			var oChange = this._aPreparedChanges[index];
			this.oModel.deleteVariantChange(this.sVariantManagementReference, mPropertyBag, oChange);
		}.bind(this));

		this._aPreparedChanges = null;
		if (this._sOldVReference) {
			return this.oModel.updateCurrentVariant({
				variantManagementReference: this.sVariantManagementReference,
				newVariantReference: this._sOldVReference
			}).then(() => {
				delete this._sOldVReference;
			});
		}

		return Promise.resolve();
	};

	return ControlVariantConfigure;
});
