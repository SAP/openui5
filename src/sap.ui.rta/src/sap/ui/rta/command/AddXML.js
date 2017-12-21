/*!
 * ${copyright}
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/rta/command/FlexCommand'
], function(
	jQuery,
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
	 * @experimental Since 1.54. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var AddXML = FlexCommand.extend("sap.ui.rta.command.AddXML", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				fragment : {
					type : "string"
				},
				fragmentPath : {
					type : "string"
				},
				targetAggregation : {
					type : "string"
				},
				index: {
					type: "int"
				},
				changeType : {
					type : "string",
					defaultValue : "addXML"
				}
			},
			associations : {},
			events : {}
		}
	});

	AddXML.prototype._getChangeSpecificData = function() {
		var mSpecificInfo = {
			changeType : this.getChangeType(),
			fragmentPath: this.getFragmentPath(),
			targetAggregation: this.getTargetAggregation(),
			index: this.getIndex()
		};

		return mSpecificInfo;
	};

	/**
	 * @override
	 */
	AddXML.prototype._applyChange = function(vChange, bNotMarkAsAppliedChange) {
		vChange.getDefinition().content.fragment = this.getFragment();
		return FlexCommand.prototype._applyChange.apply(this, arguments)

		.then(function() {
			delete vChange.getDefinition().content.fragment;
		});
	};

	return AddXML;

}, /* bExport= */true);
