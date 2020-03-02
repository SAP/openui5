/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/deepEqual",
	"sap/base/util/each",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"./config/index"
], function (
	deepEqual,
	each,
	merge,
	ObjectPath,
	BaseEditor,
	oDefaultCardConfig
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var CardEditor = BaseEditor.extend("sap.ui.integration.designtime.cardEditor.CardEditor", {
		constructor: function() {
			BaseEditor.prototype.constructor.apply(this, arguments);
			this.addDefaultConfig(oDefaultCardConfig);
		},
		renderer: BaseEditor.getMetadata().getRenderer()
	});

	function addValueToDiff(oDiff, sObjectName, sName, sKey, vValue) {
		if (!oDiff[sObjectName]) {
			oDiff[sObjectName] = {};
		}
		if (!oDiff[sObjectName][sName]) {
			oDiff[sObjectName][sName] = {};
		}
		oDiff[sObjectName][sName][sKey] = vValue;
	}

	function getCardConfigurationDeltaForChange(oJson, oInitialJson) {
		var oConfiguration = ObjectPath.get(["sap.card", "configuration"], oJson);
		var oInitialConfiguration = ObjectPath.get(["sap.card", "configuration"], oInitialJson);

		if (deepEqual(oConfiguration, oInitialConfiguration)) {
			return undefined;
		}

		var oDiff = {};

		each(oConfiguration, function(sObjectName, oObject) {
			each(oObject, function(sName, oSubObject) {
				if (!oInitialConfiguration[sObjectName][sName]) {
					oDiff[sObjectName] = oDiff[sObjectName] || {};
					oDiff[sObjectName][sName] = oSubObject;
				} else {
					each(oSubObject, function(sKey, oValue) {
						if (oInitialConfiguration[sObjectName][sName][sKey] !== oValue) {
							addValueToDiff(oDiff, sObjectName, sName, sKey, oValue);
						}
					});
				}
			});
		});

		return {
			configuration: oDiff
		};
	}

	CardEditor.prototype.init = function () {
		BaseEditor.prototype.init.apply(this, arguments);
		this.attachJsonChange(function (oEvent) {
			if (!this._oInitialJson) {
				this._oInitialJson = oEvent.getParameter("json");
			}
		}, this);

	};

	/**
	 *
	 * @param {Object} oPropertyBag - Property bag
	 * @param {String} oPropertyBag.layer - Layer of the Change
	 * @returns {Promise<object>} Promise with the change definition for the current delta changes
	 */
	CardEditor.prototype.getDeltaChangeDefinition = function(oPropertyBag) {
		return new Promise(function (resolve, reject) {
			sap.ui.require(["sap/ui/fl/Change"], function (Change) {
				var mParameters = merge({}, oPropertyBag);
				mParameters.content = getCardConfigurationDeltaForChange(this.getJson(), this._oInitialJson);

				if (!mParameters.content) {
					reject("No Change");
				}

				mParameters.changeType = "appdescr_card";
				mParameters.creation = new Date().toISOString();
				mParameters.generator = "CardEditor";
				mParameters.selector = {};
				mParameters.reference = ObjectPath.get(["sap.app", "id"], this.getJson());

				var oChangeDefinition = Change.createInitialFileContent(mParameters);
				// by default the function createInitialFileContent sets the creation to ""
				oChangeDefinition.creation = new Date().toISOString();

				this._oInitialJson = undefined;

				resolve(oChangeDefinition);
			}.bind(this));
		}.bind(this));
	};

	return CardEditor;
});
