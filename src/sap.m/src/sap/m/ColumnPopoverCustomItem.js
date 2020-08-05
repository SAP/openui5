/*
 * ! ${copyright}
 */
sap.ui.define(['./ColumnPopoverItem', 'sap/m/ToggleButton'], function(ColumnPopoverItem, ToggleButton) {
	"use strict";

	/**
	 * Constructor for the element.
	 *
	 * @param {string} [sId] id for the new element.
	 * @param {string} [mSettings] initial settings for the new element.
	 *
	 * @class
	 * The <code>ColumnPopoverCustomItem</code> provides the capabilities to perform custom behaviour in ColumnHeaderPopover.
	 * @extends sap.m.ColumnPopoverItem
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @since 1.63
	 * @private
	 * @alias sap.m.ColumnPopoverCustomItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnPopoverCustomItem = ColumnPopoverItem.extend("sap.m.ColumnPopoverCustomItem", /** @lends sap.m.ColumnPopoverCustomItem.prototype */
	{
		library: "sap.m",
		metadata: {
			properties: {
				/**
				 * Customitem button icon
				 */
				icon: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},
				/**
				 * Customitem button text
				 */
				text: {type: "string", group: "Misc", defaultValue: null}
			},
			aggregations: {
				/**
				 * Note that the content created inside ColumnPopoverCustomItem can not be used more than once.
				 */
				content: {type: "sap.ui.core.Control", multiple: false, singularName: "content"}
			},
			events: {
				/**
				 * beforeShowContent event
				 */
				beforeShowContent: {}
			}
		}
	});

	ColumnPopoverCustomItem.prototype._createButton = function(sId, oCHPopover) {
		var oPopover = oCHPopover.getAggregation("_popover");
		var oContent = this.getContent();
		if (oContent) {
			oContent.setVisible(false);
			this._sContentId = oContent.sId;
		}
		oPopover.addContent(oContent);
		var that = this;

		return new ToggleButton(sId, {
			icon: this.getIcon(),
			type: "Transparent",
			tooltip: this.getText(),
			visible: this.getVisible(),
			press: function() {
				// between two custom items
				if (oCHPopover._oShownCustomContent) {
					oCHPopover._oShownCustomContent.setVisible(false);
				}
				if (this.getPressed()) {
					// set other buttons unpressed
					oCHPopover._cleanSelection(this);

					that.fireBeforeShowContent();

					if (oContent) {
						oContent.setVisible(true);
						oCHPopover._oShownCustomContent = oContent;
					}
				} else if (oContent) {
					oContent.setVisible(false);
					oCHPopover._oShownCustomContent = null;
				}
			}
		});
	};
	return ColumnPopoverCustomItem;
});