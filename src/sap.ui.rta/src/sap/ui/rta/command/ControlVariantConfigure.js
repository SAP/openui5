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
	var ControlVariantConfigure = BaseCommand.extend("sap.ui.rta.command.ControlVariantConfigure", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				control : {
					type : "any"
				},
				changes : {
					type : "array"
				}
			},
			associations : {},
			events : {}
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
	ControlVariantConfigure.prototype.execute = function() {
		var oVariantManagementControl = this.getControl();
		this.oAppComponent = flUtils.getAppComponentForControl(oVariantManagementControl);
		this.oModel = this.oAppComponent.getModel(flUtils.VARIANT_MODEL_NAME);
		this.sVariantManagementReference = JsControlTreeModifier.getSelector(oVariantManagementControl, this.oAppComponent).id;

		this._aPreparedChanges = [];
		this.getChanges().forEach(function(mChangeProperties) {
			mChangeProperties.appComponent = this.oAppComponent;
			this._aPreparedChanges.push(this.oModel.setVariantProperties(this.sVariantManagementReference, mChangeProperties, true));
		}.bind(this));

		return Promise.resolve().then(function() {
			this.oModel.checkUpdate(true);
		}.bind(this));
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
					mPropertyBag[sProperty] = true; /*visibility of the variant always set back to true on undo*/
				} else if (mChangeProperties[sOriginalProperty]) {
					mPropertyBag[sProperty] = mChangeProperties[sOriginalProperty];
					mPropertyBag[sOriginalProperty] = mChangeProperties[sProperty];
				} else if (sProperty.indexOf("original") === -1) {
					mPropertyBag[sProperty] = mChangeProperties[sProperty];
				}
			});
			mPropertyBag.change = this._aPreparedChanges[index];
			this.oModel.setVariantProperties(this.sVariantManagementReference, mPropertyBag, false);
		}.bind(this));

		return Promise.resolve().then(function() {
			this.oModel.checkUpdate(true);
			this._aPreparedChanges = null;
		}.bind(this));
	};

	return ControlVariantConfigure;
});
