/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/rta/library"
], function(
	BaseCommand,
	SmartVariantManagementWriteAPI,
	rtaLibrary
) {
	"use strict";

	/**
	 * Change the content of a SmartVariantManagement variant
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.102
	 * @alias sap.ui.rta.command.compVariant.CompVariantContent
	 */
	var CompVariantContent = BaseCommand.extend("sap.ui.rta.command.compVariant.CompVariantContent", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				variantId: {
					type: "string"
				},
				persistencyKey: {
					type: "string"
				},
				newContent: {
					type: "object"
				},
				isModifiedBefore: {
					type: "boolean"
				}
			}
		}
	});

	function callFlAPIFunction(sFunctionName, sKey, oValue) {
		var mPropertyBag = {
			...oValue,
			...this.mInformation,
			id: sKey,
			control: this.getElement()
		};
		return SmartVariantManagementWriteAPI[sFunctionName](mPropertyBag);
	}

	// private function of the SmartVariantManagement are approved and documented to be used from here
	function setVariantContent(oContent) {
		var oVariantManagementControl = this.getElement();
		var oCurrentVariantContent = oVariantManagementControl._getVariantContent(this.getVariantId());
		var oNewVariantContent = { ...oCurrentVariantContent };
		if (oVariantManagementControl.isPageVariant()) {
			var oContentToBeSet = {};
			oContentToBeSet[this.getPersistencyKey()] = oContent;
			oVariantManagementControl._applyVariantByPersistencyKey(this.getPersistencyKey(), oContentToBeSet, "KEY_USER");
			oNewVariantContent[this.getPersistencyKey()] = oContent;
		} else {
			oVariantManagementControl._applyVariant(oVariantManagementControl._getPersoController(), oContent, "KEY_USER");
			oNewVariantContent = oContent;
		}
		return oNewVariantContent;
	}

	CompVariantContent.prototype.prepare = function(mFlexSettings, sVariantManagementReference, sCommand) {
		this.mInformation = {
			layer: mFlexSettings.layer,
			command: sCommand, // used for ChangeVisualization and should end up in the support object in change definition
			generator: rtaLibrary.GENERATOR_NAME // also to be saved in the support section
		};
		return true;
	};

	CompVariantContent.prototype.execute = function() {
		this.getElement().setModified(true);
		var oNewVariantContent = setVariantContent.call(this, this.getNewContent());
		callFlAPIFunction.call(this, "updateVariantContent", this.getVariantId(), {content: oNewVariantContent});
		return Promise.resolve();
	};

	CompVariantContent.prototype.undo = function() {
		var oVariant = callFlAPIFunction.call(this, "revert", this.getVariantId(), {});
		this.getElement().setModified(this.getIsModifiedBefore());
		var oVariantManagementControl = this.getElement();
		if (oVariantManagementControl.isPageVariant()) {
			setVariantContent.call(this, oVariant.getContent()[this.getPersistencyKey()]);
		} else {
			setVariantContent.call(this, oVariant.getContent());
		}
		return Promise.resolve();
	};

	return CompVariantContent;
});
