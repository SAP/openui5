/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/rta/command/BaseCommand',
	'sap/ui/fl/changeHandler/BaseTreeModifier',
	'sap/ui/fl/Utils'
], function(BaseCommand, BaseTreeModifier, flUtils) {
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
		metadata : {
			library : "sap.ui.rta",
			properties : {
				oldText : {
					type : "string"
				},
				newText : {
					type : "string"
				}
			},
			associations : {},
			events : {}
		}
	});

	ControlVariantSetTitle.prototype.MODEL_NAME = "$FlexVariants";

	/**
	 * @override
	 */
	ControlVariantSetTitle.prototype.prepare = function(mFlexSettings, sVariantManagementReference) {
		this.sLayer = mFlexSettings.layer;
		return true;
	};

	ControlVariantSetTitle.prototype.getPreparedChange = function() {
		this._oPreparedChange = this.getVariantChange();
		if (!this._oPreparedChange) {
			jQuery.sap.log.error("No prepared change available for ControlVariantSetTitle");
		}
		return this._oPreparedChange;
	};

	/**
	 * @public Template Method to implement execute logic, with ensure precondition Element is available
	 * @returns {Promise} Returns resolve after execution
	 */
	ControlVariantSetTitle.prototype.execute = function() {
		var oVariantManagementControl = this.getElement(),
			oVariantManagementControlBinding = oVariantManagementControl.getTitle().getBinding("text");

		this.oAppComponent = flUtils.getAppComponentForControl(oVariantManagementControl);
		this.oModel = this.oAppComponent.getModel(this.MODEL_NAME);
		this.sVariantManagementReference = BaseTreeModifier.getSelector(oVariantManagementControl, this.oAppComponent).id;
		this.sCurrentVariant = this.oModel.getCurrentVariantReference(this.sVariantManagementReference);

		var sCurrentTitle = this.oModel.getVariantProperty(this.sCurrentVariant, "title");
		this.setOldText(sCurrentTitle);

		var mPropertyBag = {
			appComponent : this.oAppComponent,
			variantReference : this.sCurrentVariant,
			changeType : "setTitle",
			title : this.getNewText(),
			layer : this.sLayer
		};

		return Promise.resolve(this.oModel._setVariantProperties(this.sVariantManagementReference, mPropertyBag, true))
						.then(function(oChange) {
								this._oVariantChange = oChange;
								oVariantManagementControlBinding.checkUpdate(true); /*Force Update as binding key stays same*/
						}.bind(this));
	};

	/**
	 * @public Template Method to implement undo logic
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantSetTitle.prototype.undo = function() {
		var oVariantManagementControlBinding = this.getElement().getTitle().getBinding("text"),
			mPropertyBag = {
			variantReference : this.sCurrentVariant,
			changeType : "setTitle",
			title : this.getOldText(),
			change: this._oVariantChange
		};

		return Promise.resolve(this.oModel._setVariantProperties(this.sVariantManagementReference, mPropertyBag, false))
						.then(function(oChange) {
								this._oVariantChange = oChange;
								oVariantManagementControlBinding.checkUpdate(true); /*Force Update as binding key stays same*/
						}.bind(this));
	};

	return ControlVariantSetTitle;

}, /* bExport= */true);
