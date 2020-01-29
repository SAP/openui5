/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/Image",
	"./Adaptation",
	"../Utils",
	"sap/base/Log"
],
function(
	Image,
	Adaptation,
	Utils,
	Log
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
		renderer: 'sap.ui.rta.toolbar.AdaptationRenderer',
		type: 'fiori'
	});

	Fiori.prototype.init = function () {
		this._oRenderer = Utils.getFiori2Renderer();
		this._oFioriHeader = this._oRenderer.getRootControl().getOUnifiedShell().getHeader();
		Adaptation.prototype.init.apply(this, arguments);
	};

	Fiori.prototype.show = function () {
		this._oFioriHeader.addStyleClass(FIORI_HIDDEN_CLASS);

		return Adaptation.prototype.show.apply(this, arguments);
	};

	Fiori.prototype.buildControls = function () {
		return Adaptation.prototype.buildControls.apply(this, arguments).then(function (aControls) {
			var sLogoPath = this._oFioriHeader.getLogo();

			if (this._oFioriHeader.getShowLogo() && sLogoPath) {
				// Unstable: if FLP changes ID of <img/> element, logo could be not found
				var $logo = this._oFioriHeader.$().find('#shell-header-icon');
				var iWidth;
				var iHeight;

				if ($logo.length) {
					iWidth = $logo.width();
					iHeight = $logo.height();
					this._checkLogoSize($logo, iWidth, iHeight);
				}

				this.getControl("iconSpacer").setWidth("10%");

				// first control is the left HBox
				this.getControl("iconBox").addItem(
					new Image("sapUiRta_icon", {
						src: sLogoPath,
						width: iWidth ? iWidth + 'px' : iWidth,
						height: iHeight ? iHeight + 'px' : iHeight
					})
				);
			}
			return aControls;
		}.bind(this));
	};

	Fiori.prototype.hide = function () {
		return Adaptation.prototype.hide.apply(this, arguments)
		.then(function () {
			this._oFioriHeader.removeStyleClass(FIORI_HIDDEN_CLASS);
		}.bind(this));
	};

	Fiori.prototype._checkLogoSize = function($logo, iWidth, iHeight) {
		var iNaturalWidth = $logo.get(0).naturalWidth;
		var iNaturalHeight = $logo.get(0).naturalHeight;

		if (iWidth !== iNaturalWidth || iHeight !== iNaturalHeight) {
			Log.error([
				"sap.ui.rta: please check Fiori Launchpad logo, expected size is",
				iWidth + "x" + iHeight + ",",
				"but actual is " + iNaturalWidth + "x" + iNaturalHeight
			].join(' '));
		}
	};

	Fiori.prototype.destroy = function () {
		// In case of destroy() without normal hide() call.
		this._oFioriHeader.removeStyleClass(FIORI_HIDDEN_CLASS);

		delete this._oRenderer;
		delete this._oFioriHeader;

		Adaptation.prototype.destroy.apply(this, arguments);
	};

	return Fiori;
}, true);