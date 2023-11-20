/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/util/ManifestResolver"
], function (library, Card, ManifestResolver) {
	"use strict";

	//Shortcut to sap.ui.integration.library.CardDataMode
	var CardDataMode = library.CardDataMode;

	/**
	 * Constructor for a new <code>SkeletonCard</code>.
	 * @inherit
	 * @class
	 *
	 * Represents a card which can work without being rendered.
	 *
	 * @extends sap.ui.integration.widgets.Card
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @ui5-restricted Mobile SDK
	 * @since 1.98
	 * @alias sap.ui.integration.util.SkeletonCard
	 */
	var SkeletonCard = Card.extend("sap.ui.integration.util.SkeletonCard", {
		metadata: {
			library: "sap.ui.integration"
		}
	});

	SkeletonCard.prototype.init = function () {
		Card.prototype.init.apply(this, arguments);
		this.setDataMode(CardDataMode.Active);
	};

	/**
	 * Resolves the card manifest to a static manifest.
	 * Processes all bindings and translations then returns the result as a static manifest in which bindings and translations are resolved.
	 *
	 * @returns {Promise<object>} Promise which resolves with manifest with resolved bindings and translations or rejects with an error message if there is an error.
	 */
	SkeletonCard.prototype.resolveManifest = function () {
		return ManifestResolver.resolveCard(this);
	};

	/**
	 * @private
	 */
	SkeletonCard.prototype.isSkeleton = function () {
		return true;
	};

	/**
	 * @override
	 */
	SkeletonCard.prototype.refresh = function () {
		Card.prototype.refresh.apply(this);
		this.startManifestProcessing();
	};

	/**
	 * @override
	 * @returns {sap.ui.integration.util.SkeletonCard} The result card.
	 */
	SkeletonCard.prototype._createCard = function (oSettings) {
		return new SkeletonCard(oSettings);
	};

	return SkeletonCard;
});
