/*!
 * ${copyright}
 */

// Provides control sap.m.CustomDynamicDateOption.
sap.ui.define(['sap/m/DynamicDateOption'],
	function(DynamicDateOption) {
		"use strict";

		/**
		 * Constructor for a new CustomDynamicDateOption.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * A custom option for the DynamicDateRange control.
		 * @extends sap.m.DynamicDateOption
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @public
		 * @since 1.92
		 * @alias sap.m.CustomDynamicDateOption
		 * @experimental Since 1.92. This class is experimental and provides only limited functionality. Also the API might be changed in future.
		 */
		var CustomDynamicDateOption = DynamicDateOption.extend("sap.m.CustomDynamicDateOption", /** @lends sap.m.CustomDynamicDateOption.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Defines a method that provides the option's label text.
					 */
					getText: { type: "function" },
					/**
					 * Defines a method that provides the option's value help UI types. Based on the types a functional
					 * value help dialog will be created. Types are DynamicDateValueHelpUIType instances.
					 */
					getValueHelpUITypes: { type: "function" },
					/**
					 * Defines a method that can create the option's value help UI. For custom scenarios where
					 * getValueHelpUITypes is not enough to define the UI.
					 */
					createValueHelpUI: { type: "function" },
					/**
					 * Defines a method that can validate all controls from the value help UI related to a given option.
					 */
					validateValueHelpUI: { type: "function" },
					/**
					 * Defines a method that can collect the value from the value help UI.
					 */
					getValueHelpOutput: { type: "function" },
					/**
					 * Defines a method that provides the order index of the option's group.
					 * Used for grouping within the options list inside a DynamicDateRange's popup.
					 */
					getGroup: { type: "function" },
					/**
					 * Defines a method that provides the option's group header text.
					 */
					getGroupHeader: { type: "function" },
					/**
					 * Defines a method that formats the option's value to a string. See DynamicDateOption.format.
					 */
					format: { type: "function" },
					/**
					 * Defines a method that parses the option's value from a string. See DynamicDateOption.parse.
					 */
					parse: { type: "function" },
					/**
					 * Defines a method that calculates an absolute date range from the options relative value. See DynamicDateOption.toDates.
					 */
					toDates: { type: "function" },
					/**
					 * Defines a method that controls whether the formatted date range should be concatenated to the
					 * formatted value when displayed.
					 */
					enhanceFormattedValue: { type: "function" }
				}
			}
		});

		function capitalize(sString) {
			return sString.charAt(0).toUpperCase() + sString.slice(1);
		}

		["getText", "getValueHelpUITypes", "createValueHelpUI", "getValueHelpOutput", "validateValueHelpUI",
			"getGroup", "getGroupHeader", "format", "parse", "toDates", "enhanceFormattedValue"]
			.forEach(function(sFnName) {
				CustomDynamicDateOption.prototype[sFnName] = function() {
					var sGetterName = "get" + capitalize(sFnName);
					var fnCustomFn = this[sGetterName]();
					return fnCustomFn ? fnCustomFn.apply(this, arguments)
						: DynamicDateOption.prototype[sFnName].apply(this, arguments);
				};
			});

		CustomDynamicDateOption.prototype.getGroupHeader = function() {
			if ((this.getGroup() < 7 && this.getGroup() > -1) || !this.getGetGroupHeader()) {
				return DynamicDateOption.prototype.getGroupHeader.apply(this, arguments);
			} else {
				return this.getGetGroupHeader().apply(this, arguments);
			}
		};

		return CustomDynamicDateOption;
	});
