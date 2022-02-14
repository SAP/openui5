sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/HTML",
	"sap/ui/core/ResizeHandler",
	"sap/ui/dom/jquery/rect" // provides jQuery.fn.rect
], function(Control, HTML, ResizeHandler) {
	"use strict";

	return Control.extend("sap.ui.demo.toolpageapp.control.D3Chart", {

		metadata: {
			properties: {
				type: {type: "string", defaultValue: "Radial"}
			},
			aggregations: {
				_html: {
					type: "sap.ui.core.HTML",
					multiple: false,
					visibility: "hidden"
				},
				data: {
					type: "sap.ui.base.ManagedObject",
					multiple: true
				}
			},
			defaultAggregation: "data"
		},

		_iHeight: null,
		_sContainerId: null,
		_sResizeHandlerId: null,

		/**
		 * Initialize hidden html aggregation
		 */
		init: function () {
			this._sContainerId = this.getId() + "--container";
			this._iHeight = 130;
			this.setAggregation("_html", new HTML(this._sContainerId, {
				content: "<svg id=\"" + this._sContainerId + "\" width=\"100%\" height=\"130px\"></svg>"
			}));
		},

		_onResize: function (oEvent) {
			this._updateSVG(oEvent.size.width);
		},

		onBeforeRendering: function () {
			ResizeHandler.deregister(this._sResizeHandlerId);
		},

		onAfterRendering: function () {
			this._sResizeHandlerId = ResizeHandler.register(
				this,
				this._onResize.bind(this));

			var $control = this.$();
			if ($control.length > 0) {
				// jQuery Plugin "rect"
				this._updateSVG($control.rect().width);
			}
		},

		renderer: {
			apiVersion: 2,
			/**
			 * Renders the root div and the HTML aggregation
			 * @param {sap.ui.core.RenderManger} oRM the render manager
			 * @param {sap.ui.demo.toolpageapp.control.D3Chart} oControl the control to be rendered
			 */
			render: function (oRM, oControl) {
				oRM.openStart("div", oControl);
				oRM.class("customD3Chart");
				oRM.openEnd();
				oRM.renderControl(oControl.getAggregation("_html"));
				oRM.close("div");
			}
		}
	});
});