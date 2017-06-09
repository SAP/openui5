/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/Image',
	'./Adaptation',
	'../Utils'
],
function(
	Image,
	Adaptation,
	Utils
) {
	"use strict";

	/**
	 * This class is being assigned to the original Fiori Header Toolbar when RTA Toolbar shows
	 * @type {string}
	 */
	var FIORI_HIDDEN_CLASS = 'sapUiRtaFioriHeaderInvisible';

	/**
	 * Constructor for a new sap.ui.rta.toolbar.Fiori control
	 *
	 * @class
	 * Contains implementation of Fiori specific toolbar
	 * @extends sap.ui.rta.toolbar.Adaptation
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.rta.toolbar.Fiori
	 * @experimental Since 1.48. This class is experimental. API might be changed in future.
	 */
	var Fiori = Adaptation.extend("sap.ui.rta.toolbar.Fiori", {
		renderer: 'sap.ui.rta.toolbar.BaseRenderer',
		type: 'fiori'
	});

	Fiori.prototype.init = function () {
		Adaptation.prototype.init.apply(this, arguments);

		this._oRenderer = Utils.getFiori2Renderer();
		this._oFioriHeader = this._oRenderer.getRootControl().getOUnifiedShell().getHeader();
	};

	Fiori.prototype.show = function () {
		this._oFioriHeader.addStyleClass(FIORI_HIDDEN_CLASS);

		return Adaptation.prototype.show.apply(this, arguments);
	};

	Fiori.prototype.buildControls = function () {
		var aControls = Adaptation.prototype.buildControls.apply(this, arguments);
		var sLogoPath = this._oFioriHeader.getLogo();

		if (this._oFioriHeader.getShowLogo() && sLogoPath) {
			aControls.unshift(
				new Image({
					src: sLogoPath
				}).data('name', 'logo')
			);
		}

		return aControls;
	};

	Fiori.prototype.hide = function () {
		return Adaptation.prototype
			.hide.apply(this, arguments)
			.then(function () {
				this._oFioriHeader.removeStyleClass(FIORI_HIDDEN_CLASS);
			}.bind(this));
	};

	return Fiori;

}, true);
