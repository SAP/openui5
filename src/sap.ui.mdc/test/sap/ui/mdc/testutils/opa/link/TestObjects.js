/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"./Actions",
	"./Assertions",
	"./waitForLink",
	"../p13n/Actions"
], function(
	Opa5,
	linkActions,
	linkAssertions,
	waitForLink,
	p13nActions
) {
	"use strict";

	/**
	 * @namespace onTheMDCLink
	 */
	Opa5.createPageObjects({
		onTheMDCLink: {
			actions: {
				/**
				 * Object to identify a <code>sap.ui.mdc.Link</code>. Should contain at least one of the following properties: <code>text</code> and <code>id</code>.
				 * @typedef {object} LinkIdentifier
				 * @property {string} id ID of a given <code>sap.m.Link</code> that represents the <code>sap.ui.mdc.Link</code>
				 * @property {string} text Text of a given <code>sap.m.Link</code> that represents the <code>sap.ui.mdc.Link</code>
				 */
				/**
				 * Opa5 test action
				 * @memberof onTheMDCLink
				 * @method iPersonalizeTheLinks
				 * @param {LinkIdentifier} oLinkIdentifier The object to identify the <code>sap.ui.mdc.Link</code>
				 * @param {string[]} aLinks Array containing the texts of the links that are the result of the personalization
				 * @returns {Promise} OPA waitFor
				 * 1. Opens the personalization dialog of a given <code>sap.ui.mdc.Link</code>.
				 * 2. Selects all links given by <code>aLinks</code> and deselects all other links.
				 * 3. Closes the personalization dialog.
				 */
				iPersonalizeTheLinks: function(oLinkIdentifier, aLinks) {
					return waitForLink.call(this, oLinkIdentifier, {
						success: function(oLink) {
							p13nActions.iPersonalizeLink.call(this, oLink, aLinks, linkActions.iOpenThePersonalizationDialog);
						}
					});
				},
				/**
				 * Opa5 test action
				 * @memberof onTheMDCLink
				 * @method iResetThePersonalization
				 * @param {LinkIdentifier} oLinkIdentifier The object to identify the <code>sap.ui.mdc.Link</code> that is reset
				 * @returns {Promise} OPA waitFor
				 * 1. Opens the personalization dialog of a given <code>sap.ui.mdc.Link</code>.
				 * 2. Presses the Reset personalization button.
				 * 3. Confirms the Reset dialog.
				 * 4. Closes the personalization dialog.
				 */
				iResetThePersonalization: function(oLinkIdentifier) {
					return waitForLink.call(this, oLinkIdentifier, {
						success: function(oLink) {
							p13nActions.iResetThePersonalization.call(this, oLink, linkActions.iOpenThePersonalizationDialog);
						}
					});
				},
				/**
				* Opa5 test action
				* @memberof onTheMDCLink
				* @method iPressTheLink
				* @param {LinkIdentifier} oLinkIdentifier The object to identify the <code>sap.ui.mdc.Link</code> that is pressed
				* @returns {Promise} OPA waitFor
				*/
				iPressTheLink: function(oLinkIdentifier) {
					return linkActions.iPressTheLink.call(this, oLinkIdentifier);
				},
				/**
				* Opa5 test action
				* @memberof onTheMDCLink
				* @method iPressLinkOnPopover
				* @param {LinkIdentifier} oLinkIdentifier The object to identify the <code>sap.ui.mdc.Link</code> that opens the popover
				* @param {string} sLink The text of the link that is clicked on the popover
				* @returns {Promise} OPA waitFor
				* 1. Presses a given <code>sap.ui.mdc.Link</code> to open its popover.
				* 2. Presses a link on the opened popover defined by <code>sLink</code>.
				*/
				iPressLinkOnPopover: function(oLinkIdentifier, sLink) {
					return linkActions.iPressLinkOnPopover.call(this, oLinkIdentifier, sLink);
				},
				/**
				 * Opa5 test action
				 * @memberof onTheMDCLink
				 * @method iCloseThePopover
				 * @returns {Promise} OPA waitFor
				 * Closes an open popover of the <code>sap.ui.mdc.Link</code>.
				 */
				iCloseThePopover: function() {
					return linkActions.iCloseThePopover.call(this);
				}
			},
			assertions: {
				/**
				* Opa5 test action
				* @memberof onTheMDCLink
				* @method iShouldSeeAPopover
				* @param {LinkIdentifier} oLinkIdentifier The object to identify the <code>sap.ui.mdc.Link</code> that opens the popover
				* @returns {Promise} OPA waitFor
				* Creates an assumption that there is an open popover for a given <code>sap.ui.mdc.Link</code>.
				*/
				iShouldSeeAPopover: function(oLinkIdentifier) {
					return linkAssertions.iShouldSeeAPopover.call(this, oLinkIdentifier);
				},
				/**
				 * Opa5 test action
				 * @memberof onTheMDCLink
				 * @method iShouldSeeLinksOnPopover
				 * @param {LinkIdentifier} oLinkIdentifier The object to identify the <code>sap.ui.mdc.Link</code> that opens the popover
				 * @param {string[]} aLinks Array containing the texts of the links that are visible on the popover
				 * @returns {Promise} OPA waitFor
				 * Creates an assumption that there is an open popover for a given <code>sap.ui.mdc.Link</code> and checks that all given links defined in <code>aLinks</code> are on that popover in a defined order.
				 */
				iShouldSeeLinksOnPopover: function(oLinkIdentifier, aLinks) {
					return linkAssertions.iShouldSeeLinksOnPopover.call(this, oLinkIdentifier, aLinks);
				}
			}
		}
	});

});
