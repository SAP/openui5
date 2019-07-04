/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	"sap/ui/integration/host/HostConfigurationCompiler"
], function (
	Control,
	HCCompiler
) {
	"use strict";

	/**
	 * Constructor for a new <code>HostConfiguration</code>.
	 *
	 * @param {string} [sId] ID for the new host configuration.
	 *                       The id must not contain colons, backslashes, slashes, dots, comma.
	 *                       It is used to create an internal css className and threfore has restrictions
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @experimental
	 * @since 1.62
	 * @see {@link  sap.ui.integration.Card}
	 * @alias sap.ui.integration.host.HostConfiguration
	 */
	var HostConfiguration = Control.extend("sap.ui.integration.host.HostConfiguration", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * The hostConfiguration json either given as a URL string or as a JSON Object
				 */
				config: {
					type: "any"
				},
				/**
				 * The URL string to a pre-generated css file that has been create during build time
				 * This css file can be created using the HostConfigurationCompiler.js
				 */
				css: {
					type: "string"
				}
			},
			events: {
				/**
				 * Fired whenever the css changed.
				 */
				cssChanged: {}
			}
		},
		renderer: function (oRm, oControl) {
			oRm.write("<style ");
			oRm.writeElementData(oControl);
			oRm.write(">");
			oRm.write(oControl._getCssText() || "");
			oRm.write("</style>");
		}
	});

	/* public methods */

	HostConfiguration.prototype.setConfig = function (vValue, bSuppress) {
		//reset the current style to allow update onBeforeRendering
		this._sCssText = null;
		return this.setProperty("config", vValue, bSuppress);
	};

	HostConfiguration.prototype.setCss = function (vValue, bSuppress) {
		//reset the current style to allow update onBeforeRendering
		this._sCssText = null;
		return this.setProperty("css", vValue, bSuppress);
	};

	/* private methods */

	HostConfiguration.prototype.onBeforeRendering = function () {
		if (!this._sCssText) {
			if (this.getCss()) {
				this._applyCss();
			} else {
				this._applyConfig();
			}
		}
	};
	HostConfiguration.prototype._applyCss = function () {
		var sCssUrl = this.getCss();
		HCCompiler.loadResource(sCssUrl, "text").then(function (sCssText) {
			this._sCssText = sCssText;
			this.invalidate();
		}.bind(this)).catch(function () {
			//TODO: Handle loading error case
		});
	};

	HostConfiguration.prototype._applyConfig = function () {
		var vValue = this.getConfig();
		if (typeof vValue === "string") {
			//string is interpreted as url. we need to load it
			HCCompiler.loadResource(vValue, "json").then(function (vValue) {
				this._oConfig = vValue;
				this.invalidate();
			}.bind(this)).catch(function () {
				//TODO: Handle loading error case
			});
		} else if (typeof vValue === "object" && !Array.isArray(vValue)) {
			//the config is given as an object
			this._oConfig = vValue;
			this.invalidate();
		}
	};

	HostConfiguration.prototype._getCssText = function () {
		var oConfig = this._oConfig;
		if (!oConfig && !this.getCss()) {
			return "";
		}
		//if the css text is already available there is no need to recompile the cssText
		if (this._sCssText) {
			return this._sCssText;
		}
		//TODO: the id of the host config might not be a valid classname. This check needs to be enhanced.
		var sClassName = this.getId().replace(/-/g, "_").replace(/\./g, "_").replace(/\,/g, "_");
		this._sCssText = HCCompiler.generateCssText(this._oConfig, sClassName);
		this.fireCssChanged({
			cssText: this._sCssText
		});
		return this._sCssText;
	};

	HostConfiguration.prototype.generateJSONSettings = function (sType) {
		return HCCompiler.generateJSONSettings(this._oConfig, sType);
	};

	return HostConfiguration;
});