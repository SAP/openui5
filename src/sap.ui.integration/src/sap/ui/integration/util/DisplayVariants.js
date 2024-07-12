/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/deepEqual"
], function (
	library,
	BaseObject,
	JSONModel,
	deepEqual
) {
	"use strict";

	const iStandardTile = 16 * 11;

	const aSizesInOrder = [
		"large",
		"standard",
		"small",
		"standardHeader",
		"smallHeader",
		"compactHeader",
		"extraWide",
		"wide",
		"regular",
		"narrow",
		"tiny"
	];

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

		const mOldSize = oSizeModel.getData();

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

		if (!deepEqual(mSize, mOldSize) && oCard.getUseProgressiveDisclosure()) {
			oCard.refresh();
		}
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

	/**
	 * Returns the matching value from the query.
	 *
	 * size('standard') => true
	 *
	 * size({small:2, standard:5, large: 10}) => 5
	 *
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @param {string|object} vQuery The query
	 * @returns {*} The result.
	 */
	DisplayVariants.prototype.sizeFormatter = function (vQuery) {
		const oCard = this._oCard;
		const oSizeModel = oCard.getModel("size");

		if (!vQuery) {
			return vQuery;
		}

		if (typeof vQuery === "string") {
			return oSizeModel.getProperty("/" + vQuery);
		}

		if (typeof vQuery === "object") {
			let vResult = null;
			aSizesInOrder.some((sSize) => {
				if (oSizeModel.getProperty("/" + sSize)
					&& vQuery[sSize] !== undefined) {
					vResult = vQuery[sSize];
					return true;
				}
				return false;
			});
			return vResult;
		}

		return null;
	};

	DisplayVariants.prototype._observeWidth = function () {
		const oCard = this._oCard;

		const oCardDomRef = oCard.getDomRef();
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