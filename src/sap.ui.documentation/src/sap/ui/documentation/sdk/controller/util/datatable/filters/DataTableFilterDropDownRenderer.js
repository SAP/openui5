/*!
 * ${copyright}
 */

sap.ui.define([],
    function () {
        "use strict";

		/**
		 * <code>DataTableFilterDropDown</code> renderer.
		 * @author SAP SE
		 * @namespace
		 */
        var DataTableFilterDropDownRenderer = {
            apiVersion: 2
        };

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
        DataTableFilterDropDownRenderer.render = function (oRm, oControl) {
            oRm.openStart("div", oControl);
            oRm.class("selectWrapper");
            oRm.openEnd();
            oRm.openStart("a", oControl.getId() + "-filterBtn");
            oRm.class("filterBtn");
            oRm.attr("tabindex", 0);
            oRm.openEnd();
            oRm.text('Filter');
            oRm.close('a');
            oRm.openStart("ul", oControl.getId() + "-optionsList");
			oRm.attr("tabindex", 0);
            if (!oControl.getProperty("expanded")){
                oRm.style("display", "none");
            }
            oRm.openEnd();
            this.renderDefaultOptions(oRm, oControl);
            this.renderOptions(oRm, oControl);
            oRm.close("ul");
            oRm.close("div");
        };

        DataTableFilterDropDownRenderer.renderOptions = function (oRm, oControl) {
            var aOptions = oControl.getOptions(),
                aChecked = oControl.getChecked();

            aOptions.forEach(function (sOption, index) {
                oRm.openStart("li");
                oRm.openEnd("li");
                oRm.voidStart("input");
                if (aChecked[index].value) {
                    oRm.attr("checked", "true");
                }
                oRm.attr("type", "checkbox");
				oRm.attr("id", "dropDownFilterOption" + index);
                oRm.attr("index", index);
                oRm.voidEnd();
				oRm.openStart("label");
				oRm.attr("for", "dropDownFilterOption" + index);
				oRm.openEnd("label");
				oRm.text(sOption);
				oRm.close("label");
                oRm.close("li");
            });

        };

        DataTableFilterDropDownRenderer.renderDefaultOptions = function (oRm, oControl) {
            oControl.getDefaultOptions().forEach(function (oOption) {
                oRm.openStart("li");
                oRm.openEnd("li");
                oRm.openStart("a");
                oRm.attr("tabindex", 0);
                oRm.class(oOption.key);
                oRm.openEnd();
                oRm.text(oOption.text);
                oRm.close("a");
                oRm.close("li");
            });
        };

        return DataTableFilterDropDownRenderer;
    }, /* bExport= */ true);
