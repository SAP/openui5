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
	 * @experimental Since 1.75. This class is experimental and provides only limited functionality. Also the API might be
	 *			   changed in future.
	 */
	var AddIFrame = FlexCommand.extend("sap.ui.rta.command.AddIFrame", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
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
					type : "string",
					group: "content"
				},
				changeType: {
					type: "string",
					defaultValue: "addIFrame"
				}
			},
			associations : {},
			events : {}
		}
	});

	// Override to avoid url to be 'bound'
	AddIFrame.prototype.applySettings = function(mSettings) {
		var mSettingsWithoutUrl = {};
		Object.keys(mSettings)
			.filter(function (sSettingName) {
				return sSettingName !== "url";
			})
			.forEach(function (sSettingName) {
				mSettingsWithoutUrl[sSettingName] = mSettings[sSettingName];
			});
		var aArguments = [].slice.call(arguments);
		aArguments[0] = mSettingsWithoutUrl;
		FlexCommand.prototype.applySettings.apply(this, aArguments);
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
