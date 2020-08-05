/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/support/supportRules/ui/external/Highlighter",
	"sap/ui/test/_ControlFinder",
	"sap/ui/testrecorder/Constants",
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/CommunicationChannels"
], function (Highlighter, _ControlFinder, constants, CommunicationBus, CommunicationChannels) {
	"use strict";

	var oHighlighter = new Highlighter(constants.HIGHLIGHTER_ID);

	return {
		execute: function (sDomElementId, oOptions) {
			// rootElementId - the element to highlight in both app and tree
			// interactionElementId - the element for interaction idSuffix
			var sRootDomElementId = _ControlFinder._getIdentifiedDOMElementId("#" + sDomElementId);
			oHighlighter.highlight(sRootDomElementId);
			CommunicationBus.publish(CommunicationChannels.SELECT_CONTROL_IN_TREE, {
				rootElementId: sRootDomElementId,
				interactionElementId: sDomElementId
			});
		}
	};
});
