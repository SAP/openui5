/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand"
], function(
	FlexCommand
) {
	"use strict";

	/**
	 * Adds an IFrame
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.75
	 * @alias sap.ui.rta.command.AddIFrame
	 */
	var AddIFrame = FlexCommand.extend("sap.ui.rta.command.AddIFrame", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				baseId: {
					type: "string",
					group: "content"
				},
				targetAggregation: {
					type: "string",
					group: "content"
				},
				index: {
					type: "int",
					group: "content"
				},
				url: {
					type: "string",
					group: "content"
				},
				width: {
					type: "string",
					group: "content"
				},
				height: {
					type: "string",
					group: "content"
				},
				title: {
					type: "string",
					group: "content"
				},
				advancedSettings: {
					type: "object",
					defaultValue: {},
					group: "content"
				},
				changeType: {
					type: "string",
					defaultValue: "addIFrame"
				}
			},
			associations: {},
			events: {}
		}
	});

	// Override to avoid url to be 'bound'
	AddIFrame.prototype.applySettings = function(...aArgs) {
		const mSettings = aArgs[0];
		var mSettingsWithoutUrl = {};
		Object.keys(mSettings)
		.filter(function(sSettingName) {
			return sSettingName !== "url";
		})
		.forEach(function(sSettingName) {
			mSettingsWithoutUrl[sSettingName] = mSettings[sSettingName];
		});
		aArgs[0] = mSettingsWithoutUrl;
		FlexCommand.prototype.applySettings.apply(this, aArgs);
		this.setUrl(mSettings.url);
	};

	AddIFrame.prototype._getChangeSpecificData = function() {
		var mChangeSpecificData = FlexCommand.prototype._getChangeSpecificData.call(this);
		var sChangeType = mChangeSpecificData.changeType;
		delete mChangeSpecificData.changeType;
		return {
			changeType: sChangeType,
			content: mChangeSpecificData
		};
	};

	return AddIFrame;
}, /* bExport= */true);
