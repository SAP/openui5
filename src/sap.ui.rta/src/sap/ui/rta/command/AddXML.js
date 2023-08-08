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
	 * Add a control from a XML fragment
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.54
	 * @alias sap.ui.rta.command.AddXML
	 */
	var AddXML = FlexCommand.extend("sap.ui.rta.command.AddXML", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				fragment: {
					type: "string",
					group: "content"
				},
				fragmentPath: {
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
				changeType: {
					type: "string",
					defaultValue: "addXML"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * Overridden to suppress the {} being recognized as binding strings.
	 * @override
	 */
	AddXML.prototype.bindProperty = function(sName, oBindingInfo) {
		if (sName === "fragment") {
			return this.setFragment(oBindingInfo.bindingString);
		}
		return FlexCommand.prototype.bindProperty.apply(this, arguments);
	};

	/**
	 * Normally when the changes are loaded, the backend preloads the fragment as a module,
	 * When first applying a change we need to do the same.
	 * @override
	 */
	AddXML.prototype._applyChange = function(vChange) {
		// preload the module to be applicable in this session
		var mModulePreloads = {};
		mModulePreloads[vChange.getFlexObjectMetadata().moduleName] = this.getFragment();
		sap.ui.require.preload(mModulePreloads);

		return FlexCommand.prototype._applyChange.apply(this, arguments);
	};

	return AddXML;
}, /* bExport= */true);
