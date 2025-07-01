/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/Image",
	"./Adaptation",
	"../Utils",
	"sap/base/Log",
	"sap/ui/rta/toolbar/AdaptationRenderer"
],
function(
	Image,
	Adaptation,
	Utils,
	Log,
	AdaptationRenderer
) {
	"use strict";

	/**
	 * This class is being assigned to the original Fiori Header Toolbar when RTA Toolbar shows
	 * @type {string}
	 */
	const FIORI_HIDDEN_CLASS = "sapUiRtaFioriHeaderInvisible";

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
	const Fiori = Adaptation.extend("sap.ui.rta.toolbar.Fiori", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				ushellApi: {
					type: "any", // sap.ushell.api.RTA
					defaultValue: null
				}
			}
		},
		renderer: AdaptationRenderer,
		type: "fiori"
	});

	Fiori.prototype.init = function(...aArgs) {
		this._oRenderer = Utils.getFiori2Renderer();
		this._oFioriHeader = this._oRenderer.getRootControl().getShellHeader();
		Adaptation.prototype.init.apply(this, aArgs);
	};

	Fiori.prototype.show = function(...aArgs) {
		this._oFioriHeader.addStyleClass(FIORI_HIDDEN_CLASS);
		return Adaptation.prototype.show.apply(this, aArgs);
	};

	Fiori.prototype.buildControls = function(...aArgs) {
		return Adaptation.prototype.buildControls.apply(this, aArgs).then(function(aControls) {
			const sLogoPath = this.getUshellApi().getLogo();

			if (sLogoPath) {
				const oLogo = this.getUshellApi().getLogoDomRef();
				let iWidth;
				let iHeight;
				if (oLogo) {
					iWidth = oLogo.getBoundingClientRect().width;
					iHeight = oLogo.getBoundingClientRect().height;
					this._checkLogoSize(oLogo, iWidth, iHeight);
				}

				this.getControl("iconSpacer").setWidth("8px");
				this._iLogoWidth = iWidth + 8;

				this.getControl("iconBox").addItem(
					new Image(`${this.getId()}_fragment--sapUiRta_icon`, {
						src: sLogoPath,
						// type check required cause of image could have zero width and height
						width: typeof iWidth === "number" ? `${iWidth}px` : iWidth,
						height: typeof iHeight === "number" ? `${iHeight}px` : iHeight
					})
				);
			}
			return aControls;
		}.bind(this));
	};

	/**
	 * @inheritDoc
	 */
	Fiori.prototype.hide = function(...aArgs) {
		return Adaptation.prototype.hide.apply(this, aArgs)
		.then(function() {
			this._oFioriHeader.removeStyleClass(FIORI_HIDDEN_CLASS);
		}.bind(this));
	};

	Fiori.prototype._checkLogoSize = function(oLogo, iWidth, iHeight) {
		const iNaturalWidth = oLogo.naturalWidth;
		const iNaturalHeight = oLogo.naturalHeight;

		if (Math.round(iWidth) !== iNaturalWidth || Math.round(iHeight) !== iNaturalHeight) {
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

	Fiori.prototype._hideElementsOnIntersection = function(...aArgs) {
		const [sSectionName, aEntries] = aArgs;
		let bWiderThanLogo;

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
				const iHiddenWidth = aEntries[0].boundingClientRect.width - aEntries[0].intersectionRect.width;
				bWiderThanLogo = iHiddenWidth > this._iLogoWidth;
				this._iLogoVisibilityLimit = this._calculateWindowWidth(aEntries);
				this._setLogoVisibility(false);
				if (bWiderThanLogo) {
					Adaptation.prototype._hideElementsOnIntersection.apply(this, aArgs);
				}
				return;
			}
		}
		Adaptation.prototype._hideElementsOnIntersection.apply(this, aArgs);
	};

	Fiori.prototype._setLogoVisibility = function(bVisible) {
		const oIconBox = this.getControl("iconBox");
		const oIconSpacer = this.getControl("iconSpacer");
		oIconBox.setVisible(bVisible);
		oIconSpacer.setVisible(bVisible);
	};

	Fiori.prototype.destroy = function(...aArgs) {
		// In case of destroy() without normal hide() call
		this._oFioriHeader.removeStyleClass(FIORI_HIDDEN_CLASS);

		Adaptation.prototype.destroy.apply(this, aArgs);
	};

	return Fiori;
});