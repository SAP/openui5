/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel"
], function (
	library,
	BaseObject,
	JSONModel
) {
	"use strict";

	const iStandardTile = 16 * 11;

	const mWidthRanges = {
		tiny: [20, 1 * iStandardTile],
		narrow: [1 * iStandardTile, 2 * iStandardTile],
		regular: [2 * iStandardTile, 4 * iStandardTile],
		wide: [4 * iStandardTile, 6 * iStandardTile],
		extraWide: [6 * iStandardTile, 10000]
	};

	const CardDisplayVariant = library.CardDisplayVariant;

	/**
	 * Constructor for a new <code>DisplayVariants</code>.
	 *
	 * @class
	 * Processes and resolves destinations configuration.
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @param {sap.ui.integration.widgets.Card} oCard The card.
	 * @private
	 * @alias sap.ui.integration.util.DisplayVariants
	 */
	const DisplayVariants = BaseObject.extend("sap.ui.integration.util.DisplayVariants", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (oCard) {
			BaseObject.call(this);
			this._oCard = oCard;

			oCard.addEventDelegate({
				onAfterRendering: this._observeWidth
			}, this);
		}
	});

	DisplayVariants.prototype.destroy = function () {
		BaseObject.prototype.destroy.apply(this, arguments);

		this._oWidthObserver = null;
	};

	DisplayVariants.prototype.updateSizeModel = function (iWidth) {
		const oCard = this._oCard;
		if (!oCard.getDomRef()) {
			return;
		}
		const oSizeModel = oCard.getModel("size");
		const sDisplayVariant = oCard.getDisplayVariant();
		iWidth = iWidth || oCard.getDomRef().offsetWidth;
		const mSize = {
			tiny: true,
			narrow: DisplayVariants.determineSize("narrow", iWidth),
			regular: DisplayVariants.determineSize("regular", iWidth),
			wide: DisplayVariants.determineSize("wide", iWidth),
			extraWide: DisplayVariants.determineSize("extraWide", iWidth),
			compactHeader: sDisplayVariant === CardDisplayVariant.CompactHeader,
			smallHeader: sDisplayVariant === CardDisplayVariant.SmallHeader,
			standardHeader: sDisplayVariant === CardDisplayVariant.StandardHeader,
			small: sDisplayVariant === CardDisplayVariant.Small,
			standard: sDisplayVariant === CardDisplayVariant.Standard,
			large: sDisplayVariant === CardDisplayVariant.Large,
			variant: sDisplayVariant
		};
		oSizeModel.setData(mSize);
	};

	DisplayVariants.prototype.getInitialSizeModel = function () {
		return new JSONModel({
			tiny: true,
			narrow: true,
			regular: true,
			wide: false,
			extraWide: false,
			compactHeader: false,
			smallHeader: false,
			standardHeader: false,
			small: false,
			standard: true,
			large: false,
			variant: CardDisplayVariant.Standard
		});
	};

	DisplayVariants.prototype._observeWidth = function () {
		const oCardDomRef = this._oCard.getDomRef();
		if (!oCardDomRef) {
			return;
		}
		if (this._oWidthObserver) {
			this._oWidthObserver.unobserve(oCardDomRef);
		}
		this._oWidthObserver = new ResizeObserver((aEntries) => {
			const oEntry = aEntries[0];
			const iWidth = oEntry.contentRect.width;
			this.updateSizeModel(iWidth);
		});
		this._oWidthObserver.observe(oCardDomRef);
	};

	DisplayVariants.determineSize = function(sSize, iWidth) {
		if (iWidth >= mWidthRanges[sSize][0]) {
			return true;
		}
		return false;
	};

	return DisplayVariants;
});