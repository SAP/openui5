/*!
 * ${copyright}
 */

/**
 * @namespace
 * @name sap.ui.core.theming
 * @public
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Core'],
	function(jQuery, Core) {
	"use strict";


	
	
		/**
		 * A helper used for (read-only) access to CSS parameters at runtime.
		 *
		 * @class A helper used for (read-only) access to CSS parameters at runtime
		 * @author SAP SE
		 * @static
		 *
		 * @public
		 * @alias sap.ui.core.theming.Parameters
		 */
		var Parameters = {};
	
		var mParameters = null;
		var sTheme = null;
		
		function resetParameters() {
			mParameters = null;
		}
	
		/*
		 * Load parameters for a library/theme combination as identified by the URL of the library.css 
		 */
		function loadParameters() {

			// read inline parameters from css style rule
			var sUrl = jQuery(this).css("background-image");
			var aParams = /\(["']data:text\/plain;utf-8,(.*)["']\)$/i.exec(sUrl);
			if (aParams && aParams.length >= 2) {
				var sParams = aParams[1];

				// decode only if necessary 
				if (sParams.charAt(0) !== "{" && sParams.charAt(sParams.length - 1) !== "}") {
					try {
						sParams = decodeURI(sParams);
					} catch (ex) {
						jQuery.sap.log.warning("Could not decode theme parameters URI from library.css.");
					}
				}
				try {
					var oParams = jQuery.parseJSON(sParams);
					jQuery.extend(mParameters, oParams);
					return;
				} catch (ex) {
					jQuery.sap.log.warning("Could not parse theme parameters from library.css. Loading library-parameters.json as fallback solution.");
				}
			}

			// load library-parameters.json (as fallback solution)
			var sUrl = this.href,
					oResponse,
					oResult;

			// derive parameter file URL from CSS file URL
			// $1: name of library (incl. variants)
			// $2: additional parameters, e.g. for sap-ui-merged use case
			sUrl = sUrl.replace(/\/library([^\/.]*)\.(?:css|less)($|[?#])/, function($0,$1,$2) {
				return "/library-parameters.json" + ($2 ? $2 : "");
			});
			
			// load and evaluate parameter file 
			oResponse = jQuery.sap.sjax({url:sUrl,dataType:'json'});
			if (oResponse.success) {
				oResult = (typeof oResponse.data == "string") ? jQuery.parseJSON(oResponse.data) : oResponse.data; // FIXME jQuery1.7.1 always parses JSON, so why is it checked here?
				if ( jQuery.isArray(oResult) ) {
					// in the sap-ui-merged use case, multiple JSON files are merged into and transfered as a single JSON array  
					for (var j = 0; j < oResult.length; j++) {
					  jQuery.extend(mParameters, oResult[j]);
					}
				} else {
				  jQuery.extend(mParameters, oResult);
				}
			} else {
				// ignore failure at least temporarily as long as there are libraries built using outdated tools which produce no json file
				jQuery.sap.log.warning("Could not load theme parameters from: " + sUrl); // could be an error as well, but let's avoid more CSN messages...
			}
		}
	
		function getParameters() {
			if (!mParameters) {
	
				mParameters = {};
				sTheme = sap.ui.getCore().getConfiguration().getTheme();

				jQuery("link[id^=sap-ui-theme-]").each(loadParameters);

			}
			return mParameters;
		}
	
		/**
		 * Called by the Core when a new library and its stylesheet have been loaded.
		 * Must be called AFTER a link-tag (with id: "sap-ui-theme" + sLibName) for the theme has been created.
		 * @param {string} sLibName name of the theme library.
		 * @private
		 */
		Parameters._addLibraryTheme = function(sLibName) {
			// only load parameters if someone had requested them before
			if ( mParameters ) {
				var oLink = jQuery.sap.domById("sap-ui-theme-" + sLibName);
				loadParameters.apply(oLink);
			}
		};
		
		/**
		 * Returns the current value for the given CSS parameter.
		 * If no parameter is given, a map containing all parameters is returned. This map is a copy, so changing values in the map does not have any effect.
		 * For any other input or an undefined parameter name, the result is undefined.
		 *
		 * @param {string} sName the CSS parameter name
		 * @returns {any} the CSS parameter value
		 *
		 * @public
		 */
		Parameters.get = function(sName) {
	
			if (arguments.length == 1) {

				var sParam = getParameters()[sName];

				if (typeof sParam === "undefined" && typeof sName === "string") {
					// compatibility for theming parameters with colon
					var iIndex = sName.indexOf(":");
					if (iIndex !== -1) {
						sName = sName.substr(iIndex + 1);
					}
					sParam = getParameters()[sName];
				}

				return sParam;

			} else if (arguments.length == 0) {
				return jQuery.extend({}, getParameters());
			} else {
				return undefined;
			}
		};
		
		/**
		 *
		 * Uses the parameters provide to re-set the parameters map or
		 * reloads them as usually.
		 *
		 * @param {Object} mLibraryParameters
		 * @private
		 */
		Parameters._setOrLoadParameters = function(mLibraryParameters) {
			mParameters = {};
			sTheme = sap.ui.getCore().getConfiguration().getTheme();
			jQuery("link[id^=sap-ui-theme-]").each(function() {
				var $this = jQuery(this);
				var sLibname = $this.attr("id").substr(13);
				if (mLibraryParameters[sLibname]) {
					// if parameters are already provided for this lib, use them (e.g. from LessSupport)
					jQuery.extend(mParameters, mLibraryParameters[sLibname]);
				} else {
					// otherwise use inline-parameters or library-parameters.json
					loadParameters.apply(this);
				}
			});
		};
		
		/**
		 * Resets the CSS parameters which finally will reload the parameters 
		 * the next time they are queried via the method <code>get</code>.
		 * 
		 * @public
		 */
		Parameters.reset = function() {
			// hidden parameter {boolean} bOnlyWhenNecessary
			var bOnlyWhenNecessary = arguments[0] === true;
			if ( !bOnlyWhenNecessary || sap.ui.getCore().getConfiguration().getTheme() !== sTheme ) {
				resetParameters();
			}
		};
	
		/**
		 * Helper function to get an image URL based on a given theme parameter.
		 * 
		 * @private
		 * @param {string} sParamName the theme parameter which contains the logo definition. If nothing is defined the parameter 'sapUiGlobalLogo' is used.
		 * @param {boolean} bForce whether a valid URL should be returned even if there is no logo defined.
		 */
		Parameters._getThemeImage = function(sParamName, bForce) {
			sParamName = sParamName || "sapUiGlobalLogo";
			var logo = sap.ui.core.theming.Parameters.get(sParamName);
			if (logo) {
				var match = /url[\s]*\('?"?([^\'")]*)'?"?\)/.exec(logo);
				if (match) {
					logo = match[1];
				} else if (logo === "''" || logo === "none") {
					logo = null;
				}
			}
			
			if (!!bForce && !logo) {
				return sap.ui.resource('sap.ui.core', 'themes/base/img/1x1.gif');
			}
			
			return logo;
		};
	

	return Parameters;

}, /* bExport= */ true);
