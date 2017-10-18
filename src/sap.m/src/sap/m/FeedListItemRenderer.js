/*!
 * ${copyright}
 */

// Provides default renderer for the sap.m.FeedListItem
sap.ui.define(["./ListItemBaseRenderer", "sap/ui/core/Renderer", "sap/ui/Device"],
	function(ListItemBaseRenderer, Renderer, Device) {
	"use strict";


	/**
	 * FeedListItem renderer.
	 * @namespace
	 */
	var FeedListItemRenderer = Renderer.extend(ListItemBaseRenderer);

	/**
	 * Make sure that parent li is displayed as a horizontal webkit-box.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the feed list item that should be rendered
	 */
	FeedListItemRenderer.renderLIAttributes = function(oRm, oControl) {
		oRm.addClass("sapMFeedListItemTitleDiv");
		oRm.addClass("sapMFeedListShowSeparatorsAll");
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the feed list item that should be rendered
	 */
	FeedListItemRenderer.renderLIContent = function(oRm, oControl) {
		// convenience variable
		var sMyId = oControl.getId(), bIsPhone = Device.system.phone;

		oRm.write('<div');
		oRm.addClass('sapMFeedListItem');
		oRm.writeClasses();
		oRm.write('>');

		// icon
		if (oControl.getShowIcon()) {
			this._writeImageControl(oRm, oControl, sMyId);
		}

		// action button
		if (oControl.getActions().length > 0) {
			oRm.write("<div");
			oRm.writeAttributeEscaped("id", sMyId + "-action-button");
			oRm.addClass('sapMFeedListItemActionButton');
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_actionButton"));
			oRm.write("</div>");
		}

		// text (starting with sender)
		if (bIsPhone) {
			oRm.write('<div class= "sapMFeedListItemHeader sapUiSelectable ');
			if (oControl.getShowIcon()) {
				oRm.write('sapMFeedListItemHasFigure ');
			}
			if (oControl.getSender() && oControl.getTimestamp()) {
				oRm.write('sapMFeedListItemFullHeight');
			}
			oRm.write('" >');
			if (oControl.getSender()) {
				oRm.write('<p id="' + sMyId + '-name" class="sapMFeedListItemTextName sapUiSelectable">');
				oRm.renderControl(oControl._getLinkSender(false));
				oRm.write('</p>');
			}
			if (oControl.getTimestamp()) {
				// write date
				oRm.write('<p id="' + sMyId + '-timestamp" class="sapMFeedListItemTimestamp sapUiSelectable">');
				oRm.writeEscaped(oControl.getTimestamp());
				oRm.write('</p>');
			}

			oRm.write('</div>');
			oRm.write('<div class="sapMFeedListItemText sapUiSelectable">');
			oRm.write('<span id="' + sMyId + '-realtext" class="sapMFeedListItemText sapUiSelectable">');
			if (oControl._checkTextIsExpandable()) {
				this._writeCollapsedText(oRm, oControl, sMyId);
			} else {
				oRm.write(oControl._sFullText);
				oRm.write('</span>');
			}
			oRm.write('</div>');
			if (oControl.getInfo()) {
				// info
				oRm.write('<p class="sapMFeedListItemFooter sapUiSelectable">');
				if (oControl.getInfo()) {
					oRm.write('<span id="' + sMyId + '-info" class="sapMFeedListItemInfo sapUiSelectable">');
					oRm.writeEscaped(oControl.getInfo());
					oRm.write('</span>');
				}
				oRm.write('</p>');
			}
		} else {
			oRm.write('<div class= "sapMFeedListItemText ');
			if (oControl.getShowIcon()) {
				oRm.write('sapMFeedListItemHasFigure');
			}
			oRm.write('" >');
			oRm.write('<div id="' + sMyId + '-text" class="sapMFeedListItemTextText sapUiSelectable">');
			if (oControl.getSender()) {
				oRm.write('<span id="' + sMyId + '-name" class="sapMFeedListItemTextName sapUiSelectable">');
				oRm.renderControl(oControl._getLinkSender(true));
				oRm.write('</span>');
			}
			oRm.write('<span id="' + sMyId + '-realtext" class="sapMFeedListItemTextString sapUiSelectable">');
			if (oControl._checkTextIsExpandable()) {
				this._writeCollapsedText(oRm, oControl, sMyId);
			} else {
				oRm.write(oControl._sFullText);
				oRm.write('</span>');
			}
			oRm.write('</div>');
			if (oControl.getInfo() || oControl.getTimestamp()) {
				// info and date
				oRm.write('<p class="sapMFeedListItemFooter sapUiSelectable">');
				if (!sap.ui.getCore().getConfiguration().getRTL()) {
					if (oControl.getInfo()) {
						this._writeInfo(oRm, oControl, sMyId);
						// Write Interpunct separator if necessary (with spaces before and after)
						if (oControl.getTimestamp()) {
							oRm.write("<span>&#160&#160&#x00B7&#160&#160</span>");
						}
					}
					if (oControl.getTimestamp()) {
						this._writeTimestamp(oRm, oControl, sMyId);
					}
				} else {
					if (oControl.getTimestamp()) {
						this._writeTimestamp(oRm, oControl, sMyId);
					}
					if (oControl.getInfo()) {
						// Write Interpunct separator if necessary (with spaces before and after)
						if (oControl.getTimestamp()) {
							oRm.write("<span>&#160&#160&#x00B7&#160&#160</span>");
						}
						this._writeInfo(oRm, oControl, sMyId);
					}

				}
				oRm.write('</p>');
			}
			oRm.write('</div>');
		}
		oRm.write('</div>');
	};

	FeedListItemRenderer._writeImageControl = function(oRm, oControl, sId) {
		oRm.write('<figure id="' + sId + '-figure"');
		oRm.addClass('sapMFeedListItemFigure');
		if (!oControl.getIcon()) {
			oRm.addClass('sapMFeedListItemIsDefaultIcon');
		}
		oRm.writeClasses();
		oRm.write('>');
		oRm.renderControl(oControl._getImageControl());
		oRm.write('</figure>');
	};

	FeedListItemRenderer._writeCollapsedText = function(oRm, oControl, sId) {
		// 'oFeedListItem._bTextExpanded' is true if the text has been expanded and rendering needs to be done again.
		if (oControl._bTextExpanded) {
			oRm.write(oControl._sFullText);
			oRm.write('</span>');
			oRm.write('<span id="' + sId + '-threeDots" class ="sapMFeedListItemTextString">');
			oRm.write("&#32"); // space
			oRm.write('</span>');
		} else {
			oRm.write(oControl._sShortText);
			oRm.write('</span>');
			oRm.write('<span id="' + sId + '-threeDots" class ="sapMFeedListItemTextString">');
			oRm.write("&#32&#46&#46&#46&#32"); // space + three dots + space
			oRm.write('</span>');
		}
		var oLinkExpandCollapse = oControl._getLinkExpandCollapse();
		oLinkExpandCollapse.addStyleClass("sapMFeedListItemLinkExpandCollapse");
		oRm.renderControl(oLinkExpandCollapse);
	};

	FeedListItemRenderer._writeTimestamp = function(oRm, oControl, sId) {
		oRm.write('<span id="' + sId + '-timestamp" class="sapMFeedListItemTimestampText sapUiSelectable">');
		oRm.writeEscaped(oControl.getTimestamp());
		oRm.write('</span>');
	};

	FeedListItemRenderer._writeInfo = function(oRm, oControl, sId) {
		oRm.write('<span id="' + sId + '-info" class="sapMFeedListItemInfoText sapUiSelectable">');
		oRm.writeEscaped(oControl.getInfo());
		oRm.write('</span>');
	};

	return FeedListItemRenderer;

}, /* bExport= */ true);
