/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand"
], function(
	BaseCommand
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
				oldContent: {
					type: "object"
				},
				newContent: {
					type: "object"
				}
			}
		}
	});

	CompVariantContent.prototype.execute = function() {
		this.setOldContent(getCurrentVariantContent.call(this));
		setVariantContent.call(this, this.getNewContent());

		return Promise.resolve();
	};

	CompVariantContent.prototype.undo = function() {
		setVariantContent.call(this, this.getOldContent());

		return Promise.resolve();
	};

	// private function of the SmartVariantManagement are approved and documented to be used from here
	function setVariantContent(oContent) {
		var oContentToBeSet = {};
		var oVariantManagementControl = this.getElement();
		if (oVariantManagementControl.isPageVariant()) {
			oContentToBeSet[this.getPersistencyKey()] = oContent;
			oVariantManagementControl._applyVariantByPersistencyKey(this.getPersistencyKey(), oContentToBeSet, "KEY_USER");
		} else {
			oContentToBeSet = oContent;
			oVariantManagementControl._applyVariant(oVariantManagementControl._getPersoController(), oContentToBeSet, "KEY_USER");
		}
	}

	// private function of the SmartVariantManagement are approved and documented to be used from here
	function getCurrentVariantContent() {
		var oVariantManagementControl = this.getElement();
		var oOldContent = oVariantManagementControl._getVariantContent(this.getVariantId());
		if (oVariantManagementControl.isPageVariant()) {
			oOldContent = oOldContent && oOldContent[this.getPersistencyKey()];
		}
		return oOldContent;
	}

	return CompVariantContent;
});
