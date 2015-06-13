/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/semantic/ShareMenuPage", "sap/m/semantic/SemanticConfiguration", "sap/m/semantic/SemanticPageRenderer", "sap/m/PagingButton"], function(ShareMenuPage, SemanticConfiguration, SemanticPageRenderer, PagingButton) {
	"use strict";


	/**
	 * Constructor for a new DetailPage
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A DetailPage is a {@link sap.m.semantic.ShareMenuPage} that is restricted to include only semantic controls of the following semantic types:
	 *
	 * <ul>

	 * </ul>
	 *
	 * @extends sap.m.semantic.ShareMenuPage
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.DetailPage
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DetailPage = ShareMenuPage.extend("sap.m.semantic.DetailPage", /** @lends sap.m.semantic.DetailPage.prototype */ {
		metadata: {
			aggregations: {
				/**
				 * Add action
				 */
				addAction: {
					type: "sap.m.semantic.AddAction",
					multiple: false
				},
				/**
				 * Main action
				 */
				mainAction: {
					type: "sap.m.semantic.MainAction",
					multiple: false
				},
				/**
				 * Positive action
				 */
				positiveAction: {
					type: "sap.m.semantic.PositiveAction",
					multiple: false
				},
				/**
				 * Negative action
				 */
				negativeAction: {
					type: "sap.m.semantic.NegativeAction",
					multiple: false
				},
				/**
				 * Negative action
				 */
				forwardAction: {
					type: "sap.m.semantic.ForwardAction",
					multiple: false
				},
				/**
				 * Edit action
				 */
				editAction: {
					type: "sap.m.semantic.EditAction",
					multiple: false
				},
				/**
				 * Save action
				 */
				saveAction: {
					type: "sap.m.semantic.SaveAction",
					multiple: false
				},
				/**
				 * Cancel action
				 */
				cancelAction: {
					type: "sap.m.semantic.CancelAction",
					multiple: false
				},
				/**
				 * Flag action
				 */
				flagAction: {
					type: "sap.m.semantic.FlagAction",
					multiple: false
				},
				/**
				 * Favorite action
				 */
				favoriteAction: {
					type: "sap.m.semantic.FavoriteAction",
					multiple: false
				},
				/**
				 * OpenIn action
				 */
				openInAction: {
					type: "sap.m.semantic.OpenInAction",
					multiple: false
				},
				/**
				 * DiscussInJam action
				 */
				discussInJamAction: {
					type: "sap.m.semantic.DiscussInJamAction",
					multiple: false
				},
				/**
				 * ShareInJam action
				 */
				shareInJamAction: {
					type: "sap.m.semantic.ShareInJamAction",
					multiple: false
				},
				/**
				 * SendEmail action
				 */
				sendEmailAction: {
					type: "sap.m.semantic.SendEmailAction",
					multiple: false
				},
				/**
				 * SendMessage action
				 */
				sendMessageAction: {
					type: "sap.m.semantic.SendMessageAction",
					multiple: false
				},
				/**
				 * Print action
				 */
				printAction: {
					type: "sap.m.semantic.PrintAction",
					multiple: false
				},
				/**
				 * MessagesIndicator
				 */
				messagesIndicator: {
					type: "sap.m.semantic.MessagesIndicator",
					multiple: false
				},
				/**
				 * SaveAsTile button
				 */
				saveAsTileAction: {
					type: "sap.m.Button",
					multiple: false
				},
				/**
				 * Paging action
				 */
				pagingAction: {
					type: "sap.m.PagingButton",
					multiple: false
				}
			}
		},
		renderer: SemanticPageRenderer.render
	});

	/*
	Overwrite to proxy saveAsTile/pagingAction content into the respective child control aggregation
	 */
	DetailPage.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {

		if ((sAggregationName === "saveAsTileAction") 
				|| (sAggregationName === "pagingAction")) {
			
			var oPrivateReferenceName = '_' + sAggregationName;

			if (oObject) {
				this._addToInnerAggregation(oObject,
						SemanticConfiguration.getPositionInPage(sAggregationName),
						SemanticConfiguration.getSequenceOrderIndex(sAggregationName),
						bSuppressInvalidate);
				this[oPrivateReferenceName] = oObject;
			} else {//removing
				if (this[oPrivateReferenceName]) {
					this._removeFromInnerAggregation(this[oPrivateReferenceName], SemanticConfiguration.getPositionInPage(sAggregationName), bSuppressInvalidate);
					this[oPrivateReferenceName] = null;
				}
			}
			return;
		}

		ShareMenuPage.prototype.setAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
	};

	DetailPage.prototype.getAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {

		if ((sAggregationName === "saveAsTileAction") 
				|| (sAggregationName === "pagingAction")) {

				return this['_' + sAggregationName];
		}

		return ShareMenuPage.prototype.getAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
	};

	DetailPage.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {

		if ((sAggregationName === "saveAsTileAction") 
			|| (sAggregationName === "pagingAction")) {
			
			var oPrivateReferenceName = '_' + sAggregationName;

			if (this[oPrivateReferenceName]) {
				this._removeFromInnerAggregation(this[oPrivateReferenceName], SemanticConfiguration.getPositionInPage(sAggregationName), bSuppressInvalidate);
				this[oPrivateReferenceName].destroy();
				this[oPrivateReferenceName] = null;
			}
			return this;
		}

		return ShareMenuPage.prototype.destroyAggregation.call(this, sAggregationName, bSuppressInvalidate);
	};

	return DetailPage;
}, /* bExport= */ true);
