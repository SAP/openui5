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
	 * Rename control variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.50
	 * @alias sap.ui.rta.command.ControlVariantSetTitle
	 */
	var ControlVariantSetTitle = BaseCommand.extend("sap.ui.rta.command.ControlVariantSetTitle", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				oldText: {
					type: "string"
				},
				newText: {
					type: "string"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * @override
	 */
	ControlVariantSetTitle.prototype.prepare = function(mFlexSettings) {
		this.sLayer = mFlexSettings.layer;
		return true;
	};

	ControlVariantSetTitle.prototype.getPreparedChange = function() {
		this._oPreparedChange = this.getVariantChange();
		if (!this._oPreparedChange) {
			return undefined;
		}
		return this._oPreparedChange;
	};

	/**
	 * Template Method to implement execute logic, with ensure precondition Element is available.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	ControlVariantSetTitle.prototype.execute = function() {
		var oVariantManagementControl = this.getElement();

		this.oAppComponent = flUtils.getAppComponentForControl(oVariantManagementControl);
		this.oModel = this.oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
		this.sVariantManagementReference = JsControlTreeModifier.getSelector(oVariantManagementControl, this.oAppComponent).id;
		this.sCurrentVariant = this.oModel.getCurrentVariantReference(this.sVariantManagementReference);

		var sCurrentTitle = this.oModel.getVariantTitle(this.sCurrentVariant, this.sVariantManagementReference);
		this.setOldText(sCurrentTitle);

		var mPropertyBag = {
			appComponent: this.oAppComponent,
			variantReference: this.sCurrentVariant,
			changeType: "setTitle",
			title: this.getNewText(),
			layer: this.sLayer,
			generator: rtaLibrary.GENERATOR_NAME
		};

		return Promise.resolve(this.oModel.addVariantChange(this.sVariantManagementReference, mPropertyBag))
		.then(function(oChange) {
			this._oVariantChange = oChange;
		}.bind(this));
	};

	/**
	 * Template Method to implement undo logic.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantSetTitle.prototype.undo = function() {
		var mPropertyBag = {
			variantReference: this.sCurrentVariant,
			changeType: "setTitle",
			title: this.getOldText()
		};
		var oChange = this._oVariantChange;

		return Promise.resolve(this.oModel.deleteVariantChange(this.sVariantManagementReference, mPropertyBag, oChange))
		.then(function() {
			this._oVariantChange = null;
		}.bind(this));
	};

	return ControlVariantSetTitle;
});
