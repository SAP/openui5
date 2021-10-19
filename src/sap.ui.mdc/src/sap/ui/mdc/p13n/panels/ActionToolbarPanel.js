/*
 * ! ${copyright}
 */
sap.ui.define([
    "./ListView",
    "sap/ui/model/Sorter"
], function(ListView, Sorter) {
	"use strict";

    /**
	 * Constructor for a new ActionToolbarPanel
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class
	 * @extends sap.ui.mdc.p13n.panels.ListView
	 * @author SAP SE
	 * @constructor The ActionToolbarPanel is a list based view to personalize selection and ordering of a Control aggregation.
	 * @private
	 * @experimental
	 * @since 1.85
	 * @alias sap.ui.mdc.p13n.panels.ActionToolbarPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ActionToolbarPanel = ListView.extend("sap.ui.mdc.p13n.panels.ActionToolbarPanel", {
		metadata: {
            library: "sap.ui.mdc"
        },
		renderer: {
			apiVersion: 2
		}
    });

    ActionToolbarPanel.prototype._bindListItems = function(mBindingInfo) {
        var oTemplate = this.getTemplate();
		if (oTemplate) {
            var fnGetAlignment = function(oContext) {
                return oContext.getProperty("alignment");
            };
            var oSorter = new Sorter({
                path: "alignment",
                descending: false,
                group: fnGetAlignment
            });
			this._oListControl.bindItems(Object.assign({
				path: this.P13N_MODEL + ">/items",
                sorter: oSorter,
				key: "name",
				templateShareable: false,
				template: this.getTemplate().clone()
			}, mBindingInfo));
		}
    };

    return ActionToolbarPanel;

});