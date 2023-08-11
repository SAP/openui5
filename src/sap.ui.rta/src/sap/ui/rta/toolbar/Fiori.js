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
	var FIORI_HIDDEN_CLASS = "sapUiRtaFioriHeaderInvisible";

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
	 */
	var Fiori = Adaptation.extend("sap.ui.rta.toolbar.Fiori", {
		metadata: {
			library: "sap.ui.rta"
		},
		renderer: "sap.ui.rta.toolbar.AdaptationRenderer",
		type: "fiori"
	});

	Fiori.prototype.init = function() {
		this._oRenderer = Utils.getFiori2Renderer();
		this._oFioriHeader = this._oRenderer.getRootControl().getShellHeader();
		Adaptation.prototype.init.apply(this, arguments);
	};

	Fiori.prototype.show = function() {
		this._oFioriHeader.addStyleClass(FIORI_HIDDEN_CLASS);
		return Adaptation.prototype.show.apply(this, arguments);
	};

	Fiori.prototype.buildControls = function() {
		return Adaptation.prototype.buildControls.apply(this, arguments).then(function(aControls) {
			var sLogoPath = this._oFioriHeader.getLogo();

			if (this._oFioriHeader.getShowLogo() && sLogoPath) {
				// Unstable: if FLP changes ID of <img> element, logo could be not found
				// $() is still needed because this._oFioriHeader does not offer a getDomRef method
				var oLogo = this._oFioriHeader.$().find("#shell-header-icon").get(0);
				var iWidth;
				var iHeight;

				if (oLogo) {
					iWidth = oLogo.getBoundingClientRect().width;
					iHeight = oLogo.getBoundingClientRect().height;
					this._checkLogoSize(oLogo, iWidth, iHeight);
				}

				this.getControl("iconSpacer").setWidth("8px");
				this._iLogoWidth = iWidth + 8;

				// first control is the left HBox
				this.getControl("iconBox").addItem(
					new Image(`${this.getId()}_fragment--sapUiRta_icon`, {
						src: sLogoPath,
						width: iWidth ? `${iWidth}px` : iWidth,
						height: iHeight ? `${iHeight}px` : iHeight
					})
				);
			}
			return aControls;
		}.bind(this));
	};

	/**
	 * @inheritDoc
	 */
	Fiori.prototype.hide = function() {
		return Adaptation.prototype.hide.apply(this, arguments)
		.then(function() {
			this._oFioriHeader.removeStyleClass(FIORI_HIDDEN_CLASS);
		}.bind(this));
	};

	Fiori.prototype._checkLogoSize = function(oLogo, iWidth, iHeight) {
		var iNaturalWidth = oLogo.naturalWidth;
		var iNaturalHeight = oLogo.naturalHeight;

		if (iWidth !== iNaturalWidth || iHeight !== iNaturalHeight) {
			Log.error([
				"sap.ui.rta: please check Fiori Launchpad logo, expected size is",
				`${iWidth}x${iHeight},`,
				`but actual is ${iNaturalWidth}x${iNaturalHeight}`
			].join(" "));
		}
	};

	Fiori.prototype._restoreHiddenElements = function() {
		if (this._iLogoVisibilityLimit && window.innerWidth > this._iLogoVisibilityLimit) {
			this._setLogoVisibility(true);
			delete this._iLogoVisibilityLimit;
		}
		Adaptation.prototype._restoreHiddenElements.apply(this);
	};

	Fiori.prototype._hideElementsOnIntersection = function(sSectionName, aEntries) {
		var bWiderThanLogo;

		if (aEntries[0].intersectionRatio === 0) {
			this.adjustToolbarSectionWidths();
			this._observeIntersections();
			return;
		}
		if (aEntries[0].intersectionRatio < 1) {
			if (
				!this._iLogoVisibilityLimit
				&& sSectionName === Adaptation.LEFT_SECTION
			) {
				var iHiddenWidth = aEntries[0].boundingClientRect.width - aEntries[0].intersectionRect.width;
				bWiderThanLogo = iHiddenWidth > this._iLogoWidth;
				this._iLogoVisibilityLimit = this._calculateWindowWidth(aEntries);
				this._setLogoVisibility(false);
				if (bWiderThanLogo) {
					Adaptation.prototype._hideElementsOnIntersection.apply(this, arguments);
				}
				return;
			}
		}
		Adaptation.prototype._hideElementsOnIntersection.apply(this, arguments);
	};

	Fiori.prototype._setLogoVisibility = function(bVisible) {
		var oIconBox = this.getControl("iconBox");
		var oIconSpacer = this.getControl("iconSpacer");
		oIconBox.setVisible(bVisible);
		oIconSpacer.setVisible(bVisible);
	};

	Fiori.prototype.destroy = function() {
		// In case of destroy() without normal hide() call
		this._oFioriHeader.removeStyleClass(FIORI_HIDDEN_CLASS);

		Adaptation.prototype.destroy.apply(this, arguments);
	};

	return Fiori;
});