/*!
 * ${copyright}
 */

// Provides default renderer for the sap.m.FeedListItem
sap.ui.define(["./ListItemBaseRenderer", "sap/base/i18n/Localization", "sap/ui/core/Renderer", "sap/ui/Device"], function(ListItemBaseRenderer, Localization, Renderer, Device) {
"use strict";


/**
 * FeedListItem renderer.
 * @namespace
 */
var FeedListItemRenderer = Renderer.extend(ListItemBaseRenderer);
FeedListItemRenderer.apiVersion = 2;

/**
 * Make sure that parent li is displayed as a horizontal webkit-box.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.m.FeedListItem} oControl an object representation of the feed list item that should be rendered
 */
FeedListItemRenderer.renderLIAttributes = function(oRm, oControl) {
	oRm.class("sapMFeedListItemTitleDiv");
	oRm.class("sapMFeedListShowSeparatorsAll");
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
 * @param {sap.m.FeedListItem} oControl an object representation of the feed list item that should be rendered
 */
FeedListItemRenderer.renderLIContent = function(oRm, oControl) {
	// convenience variable
	var sMyId = oControl.getId(), bIsPhone = Device.system.phone;

	oRm.openStart('div');
	oRm.class('sapMFeedListItem');
	oRm.openEnd();

	// icon
	if (oControl.getShowIcon()) {
		this._writeAvatarControl(oRm, oControl, sMyId);
	}

	// text (starting with sender)
	if (bIsPhone) {
		oRm.openStart('div').class("sapMFeedListItemHeader").class("sapUiSelectable");
		if (oControl.getShowIcon()) {
			oRm.class("sapMFeedListItemHasFigure");
		}
		if (oControl.getSender() && oControl.getTimestamp()) {
			oRm.class('sapMFeedListItemFullHeight');
		}
		oRm.openEnd();
		if (oControl.getSender()) {
			oRm.openStart('p', sMyId + '-name').class("sapMFeedListItemTextName").class("sapUiSelectable").openEnd();
			oRm.renderControl(oControl._getLinkSender(false));
			oRm.close('p');
		}
		if (oControl.getTimestamp()) {
			// write date
			oRm.openStart('p', sMyId + '-timestamp').class("sapMFeedListItemTimestamp").class("sapUiSelectable").openEnd();
			oRm.text(oControl.getTimestamp());
			oRm.close('p');
		}

		oRm.close('div');
		oRm.openStart('div').class("sapMFeedListItemText").class("sapUiSelectable").openEnd();
		this._writeText(oRm, oControl, sMyId, bIsPhone);
		if (oControl._checkTextIsExpandable()) {
			this._writeCollapsedText(oRm, oControl, sMyId);
		} else {
			oRm.unsafeHtml(oControl._sFullText); // TODO consider to delegate to FormattedTextRenderer
			oRm.close('span');
		}
		oRm.close('div');
		if (oControl.getInfo()) {
			// info
			oRm.openStart('p').class("sapMFeedListItemFooter").class("sapUiSelectable").openEnd();
			if (oControl.getInfo()) {
				oRm.openStart('span', sMyId + '-info').class("sapMFeedListItemInfo").class("sapUiSelectable").openEnd();
				oRm.text(oControl.getInfo());
				oRm.close('span');
			}
			oRm.close('p');
		}
	} else {
		oRm.openStart('div').class("sapMFeedListItemText");
		if (oControl.getShowIcon()) {
			oRm.class('sapMFeedListItemHasFigure');
		}
		oRm.openEnd();
		oRm.openStart('div', sMyId + '-text').class("sapMFeedListItemTextText").class("sapUiSelectable").openEnd();
		if (oControl.getSender()) {
			oRm.openStart('span', sMyId + '-name').class("sapMFeedListItemTextName").class("sapUiSelectable").openEnd();
			oRm.renderControl(oControl._getLinkSender(true));
			oRm.close('span');
		}
		this._writeText(oRm, oControl, sMyId, bIsPhone);
		if (oControl._checkTextIsExpandable()) {
			this._writeCollapsedText(oRm, oControl, sMyId);
		} else {
			oRm.unsafeHtml(oControl._sFullText); // TODO consider to delegate to FormattedTextRenderer
			oRm.close('span');
		}
		oRm.close('div');
		if (oControl.getInfo() || oControl.getTimestamp()) {
			// info and date
			oRm.openStart('p').class("sapMFeedListItemFooter").class("sapUiSelectable").openEnd();
			if (!Localization.getRTL()) {
				if (oControl.getInfo()) {
					this._writeInfo(oRm, oControl, sMyId);
					// Write Interpunct separator if necessary (with spaces before and after)
					if (oControl.getTimestamp()) {
						oRm.openStart("span").openEnd();
						oRm.text("\u00a0\u00a0\u00B7\u00a0\u00a0");
						oRm.close("span");
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
						oRm.openStart("span").openEnd();
						oRm.text("\u00a0\u00a0\u00B7\u00a0\u00a0");
						oRm.close("span");
					}
					this._writeInfo(oRm, oControl, sMyId);
				}

			}
			oRm.close('p');
		}
		oRm.close('div');
	}
	// action button
	if (oControl.getActions().length > 0) {
		var isAllActionsNotVisible = oControl.getActions().every(function (oAction) {
			return oAction.getVisible() === false ;
		});
		if (!isAllActionsNotVisible) {
			oRm.openStart("div", sMyId + "-action-button");
			oRm.class('sapMFeedListItemActionButton');
			oRm.openEnd();
			oRm.renderControl(oControl.getAggregation("_actionButton"));
			oRm.close("div");
		}
	}


	oRm.close('div');
};

FeedListItemRenderer._writeAvatarControl = function(oRm, oControl, sId) {
	oRm.openStart('figure', sId + '-figure');
	oRm.class('sapMFeedListItemFigure');
	if (!oControl.getIcon()) {
		oRm.class('sapMFeedListItemIsDefaultIcon');
	}
	oRm.openEnd();
	oRm.renderControl(oControl._getAvatar());
	oRm.close('figure');
};

FeedListItemRenderer._writeCollapsedText = function(oRm, oControl, sId) {
	// 'oFeedListItem._bTextExpanded' is true if the text has been expanded and rendering needs to be done again.
	if (oControl._bTextExpanded) {
		oRm.unsafeHtml(oControl._sFullText); // TODO consider to delegate to FormattedTextRenderer
		oRm.close('span');
		oRm.openStart('span', sId + '-threeDots').class("sapMFeedListItemTextString").openEnd();
		oRm.text(" "); // space
		oRm.close('span');
	} else {
		oRm.unsafeHtml(oControl._sShortText); // TODO improve
		oRm.close('span');
		oRm.openStart('span', sId + '-threeDots').class("sapMFeedListItemTextString").openEnd();
		oRm.text(" ... "); // space + three dots + space
		oRm.close('span');
	}
	var oLinkExpandCollapse = oControl._getLinkExpandCollapse();
	oLinkExpandCollapse.addStyleClass("sapMFeedListItemLinkExpandCollapse");
	oRm.renderControl(oLinkExpandCollapse);
};

FeedListItemRenderer._writeTimestamp = function(oRm, oControl, sId) {
	oRm.openStart('span', sId + '-timestamp');
	oRm.class('sapMFeedListItemTimestampText');
	oRm.class('sapUiSelectable');
	if (oControl.getUnread()) {
		oRm.class('sapMFeedListItem-Unread');
	}
	oRm.openEnd();
	oRm.text(oControl.getTimestamp());
	oRm.close('span');
};

FeedListItemRenderer._writeInfo = function(oRm, oControl, sId) {
	oRm.openStart('span', sId + '-info');
	oRm.class('sapMFeedListItemInfoText');
	oRm.class('sapUiSelectable');
	if (oControl.getUnread()) {
		oRm.class('sapMFeedListItem-Unread');
	}
	oRm.openEnd();
	oRm.text(oControl.getInfo());
	oRm.close('span');
};

FeedListItemRenderer._writeText = function(oRm, oControl, sId, bIsPhone) {
	oRm.openStart('span', sId + '-realtext');
	oRm.class(bIsPhone ? 'sapMFeedListItemText' : 'sapMFeedListItemTextString');
	oRm.class('sapMFeedListItemText');
	oRm.class('sapUiSelectable');
	if (oControl.getUnread()) {
		oRm.class('sapMFeedListItem-Unread');
	}
	oRm.openEnd();
};

return FeedListItemRenderer;

});
