/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Event",
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/base/util/Version",
	"sap/ui/base/Object",
	"sap/ui/core/AnimationMode"
], function(
	BaseEvent,
	Log,
	Formatting,
	Localization,
	Version,
	BaseObject,
	AnimationMode
) {
	"use strict";

	var oVersion = new Version("${version}");

	// Lazy dependency to core
	var Core;

	// ---- change handling ----

	var mChanges;

	// ---- Configuration state and init ----

	/**
	 * Creates a new Configuration object.
	 *
	 * @class Collects and stores the configuration of the current environment.
	 *
	 * The Configuration is initialized once when the {@link sap.ui.core.Core} is created.
	 * There are different ways to set the environment configuration (in ascending priority):
	 * <ol>
	 * <li>System defined defaults</li>
	 * <li>Server wide defaults, read from /sap-ui-config.json</li>
	 * <li>Properties of the global configuration object window["sap-ui-config"]</li>
	 * <li>A configuration string in the data-sap-ui-config attribute of the bootstrap tag.</li>
	 * <li>Individual data-sap-ui-<i>xyz</i> attributes of the bootstrap tag</li>
	 * <li>Using URL parameters</li>
	 * <li>Setters in this Configuration object (only for some parameters)</li>
	 * </ol>
	 *
	 * That is, attributes of the DOM reference override the system defaults, URL parameters
	 * override the DOM attributes (where empty URL parameters set the parameter back to its
	 * system default). Calling setters at runtime will override any previous settings
	 * calculated during object creation.
	 *
	 * The naming convention for parameters is:
	 * <ul>
	 * <li>in the URL : sap-ui-<i>PARAMETER-NAME</i>="value"</li>
	 * <li>in the DOM : data-sap-ui-<i>PARAMETER-NAME</i>="value"</li>
	 * </ul>
	 * where <i>PARAMETER-NAME</i> is the name of the parameter in lower case.
	 *
	 * Values of boolean parameters are case insensitive where "true" and "x" are interpreted as true.
	 *
	 * @hideconstructor
	 * @extends sap.ui.base.Object
	 * @public
	 * @alias sap.ui.core.Configuration
	 * @deprecated As of version 1.120. There's no single replacement for this class. Instead,
	 *   several facades have been created for different topics, e.g. {@link module:sap/base/i18n/Localization
	 *   Localization} for settings related to localization, {@link module:sap/base/i18n/Formatting Formatting}
	 *   for settings related to data formatting, {@link module:sap/ui/core/Theming Theming} for theming related
	 *   settings, {@link module:sap/ui/core/ControlBehavior ControlBehavior} for settings that are typically
	 *   required when implementing the behavior of a control, {@link module:sap/ui/security/Security Security}
	 *   for settings around security.
	 *
	 *   Please check the individual methods of this class for their replacements, if any.
	 *
	 * @borrows module:sap/base/i18n/Localization.getLanguagesDeliveredWithCore as getLanguagesDeliveredWithCore
	 * @borrows module:sap/base/i18n/Localization.getSupportedLanguages as getSupportedLanguages
	 * @borrows module:sap/ui/core/getCompatibilityVersion as getCompatibilityVersion
	 */
	var Configuration = BaseObject.extend("sap.ui.core.Configuration", /** @lends sap.ui.core.Configuration.prototype */ {

		constructor : function() {
			BaseObject.call(this);
			Log.error(
				"Configuration is designed as a singleton and should not be created manually! " +
				"Please require 'sap/ui/core/Configuration' instead and use the module export directly without using 'new'."
			);

			return Configuration;
		}

	});

	Object.assign(Configuration, /** @lends sap.ui.core.Configuration */ {
		/**
		 * Returns the version of the framework.
		 *
		 * Similar to <code>sap.ui.version</code>.
		 *
		 * @return {module:sap/base/util/Version} the version
		 * @public
		 * @deprecated As of Version 1.120. Please use the async {@link module:sap/ui/VersionInfo.load VersionInfo.load} instead.
		 */
		getVersion: function () {
			return oVersion;
		},

		getCompatibilityVersion : undefined/*getCompatibilityVersion*/,
		getLanguagesDeliveredWithCore : Localization.getLanguagesDeliveredWithCore,
		getSupportedLanguages : Localization.getSupportedLanguages
	});

	/**
	 * <code>full</code> represents a mode with unrestricted animation capabilities.
	 * @public
	 * @name sap.ui.core.Configuration.AnimationMode.full
	 * @member
	 */

	/**
	 * <code>basic</code> can be used for a reduced, more light-weight set of animations.
	 * @public
	 * @name sap.ui.core.Configuration.AnimationMode.basic
	 * @member
	 */

	/**
	 * <code>minimal</code> includes animations of fundamental functionality.
	 * @public
	 * @name sap.ui.core.Configuration.AnimationMode.minimal
	 * @member
	 */

	/**
	 * <code>none</code> deactivates the animation completely.
	 * @public
	 * @name sap.ui.core.Configuration.AnimationMode.none
	 * @member
	 */
	Configuration.AnimationMode = AnimationMode;

	//enable Eventing
	Localization.attachChange(function(oEvent) {
		if (!mChanges && Core) {} else if (mChanges) {
			Object.assign(mChanges, BaseEvent.getParameters(oEvent));
		}
	});

	Formatting.attachChange(function(oEvent) {
		const mParameters = BaseEvent.getParameters(oEvent);
		Object.keys(oEvent).forEach((sName) => {
			if (["ABAPDateFormat", "ABAPTimeFormat", "ABAPNumberFormat"].includes(sName)) {
				mParameters[sName.replace("ABAP", "legacy")] = mParameters[sName];
				delete mParameters[sName];
			} else if (sName === 'customIslamicCalendarData') {
				mParameters['legacyDateCalendarCustomizing'] = mParameters[sName];
				delete mParameters[sName];
			}
		});
		if (!mChanges && Core) {} else if (mChanges) {
			Object.assign(mChanges, mParameters);
		}
	});

	return Configuration;
});