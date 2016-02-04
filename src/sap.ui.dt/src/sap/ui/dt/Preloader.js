/*!
 * ${copyright}
 */

 /*global Promise */

// Provides object sap.ui.dt.Preloader.
sap.ui.define([
	"sap/ui/core/Element"
],
function(Element) {
	"use strict";

	/**
	 * Class for Preloader.
	 *
	 * @class
	 * Preloader for design time metadata.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @deprecated
	 * @static
	 * @since 1.30
	 * @alias sap.ui.dt.Preloader
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var Preloader = {
	};

	/**
	 * @return {Promise} resolved promise
	 * @deprecated
	 */
	Preloader.load = function() {
		jQuery.sap.log.warning("sap.ui.dt.Preloader is deprecated");
		return Promise.resolve();
	};

	/**
	 * @return {Promise} resolved promise
	 * @deprecated
	 */
	Preloader.loadLibraries = function() {
		jQuery.sap.log.warning("sap.ui.dt.Preloader is deprecated");
		return Promise.resolve();
	};

	/**
	 * @return {Promise} resolved promise
	 * @deprecated
	 */
	Preloader.loadAllLibraries = function() {
		jQuery.sap.log.warning("sap.ui.dt.Preloader is deprecated");
		return Promise.resolve();
	};

	return Preloader;
}, /* bExport= */ true);
