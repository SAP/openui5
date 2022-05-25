/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/ResizeHandler",
	"sap/ui/dom/units/Rem"
], function (
	Control,
	Core,
	ResizeHandler,
	Rem
) {
	"use strict";

	var SECOND_COLUMN_DISPLAY_THRESHOLD = 400;
	var PAIR_ROWS_HEIGHT = Rem.toPx(3.25);

	/**
	 * Constructor for a new <code>ObjectPlaceholder</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.104
	 * @alias sap.f.cards.loading.ObjectPlaceholder
	 */
	var ObjectPlaceholder = Control.extend("sap.f.cards.loading.ObjectPlaceholder", {
		metadata: {
			library: "sap.f",
			properties: {
				groups: {
					type: "object"
				},
				configuration: {
					type: "object"
				}
			},
			aggregations: {
				 _rootLayout: {
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oObjectPlaceholder) {
				var oResBundle = Core.getLibraryResourceBundle("sap.ui.core"),
					sTitle = oResBundle.getText("BUSY_TEXT");

				oRm.openStart("div", oObjectPlaceholder)
					.class("sapFCardContentPlaceholder")
					.class("sapFCardContentObjectPlaceholder")
					.attr("tabindex", "0")
					.attr("title", sTitle);

				oRm.accessibilityState(oObjectPlaceholder, {
					role: "progressbar",
					valuemin: "0",
					valuemax: "100"
				});
				oRm.openEnd();

				for (var i = 0; i < oObjectPlaceholder._iColsCnt; i++) {
					this.renderColumn(oRm, oObjectPlaceholder._iRowsCnt);
				}

				oRm.close("div");
			},
			renderColumn: function (oRm, iRowsCnt) {
				oRm.openStart("div")
					.class("sapFCardObjectPlaceholderColumn")
					.openEnd();

				for (var i = 0; i < iRowsCnt; i++) {
					this.renderRow(oRm, "First", false);
					this.renderRow(oRm, "Second", i === iRowsCnt);
				}

				oRm.close("div");
			},
			renderRow: function (oRm, sRow, bLastInColumn) {
				oRm.openStart("div")
					.class("sapFCardLoadingShimmer")
					.class("sapFCardObjectPlaceholderGroup" + sRow + "Row");

				if (bLastInColumn) {
					oRm.class("sapFCardObjectPlaceholderGroupLastRow");
				}

				oRm.openEnd()
					.close("div");
			}
		}
	});

	ObjectPlaceholder.prototype.init = function () {
		this._iColsCnt = 1;
		this._iRowsCnt = 0;
	};

	ObjectPlaceholder.prototype.exit = function () {
		this._deregisterResizeHandler();
	};

	ObjectPlaceholder.prototype.onBeforeRendering = function () {
		this._deregisterResizeHandler();
	};

	ObjectPlaceholder.prototype.onAfterRendering = function () {
		this._sResizeListenerId = ResizeHandler.register(this.getDomRef(), this._handleResize.bind(this));
		this._handleResize();
	};

	ObjectPlaceholder.prototype._handleResize = function () {
		var iAvailableHeight = this.$().height();
		var iFitCnt = Math.floor(iAvailableHeight / PAIR_ROWS_HEIGHT);

		var iColsCnt = this.$().width() >  SECOND_COLUMN_DISPLAY_THRESHOLD ? 2 : 1;

		if (this._iRowsCnt !== iFitCnt || this._iColsCnt !== iColsCnt) {
			this._iRowsCnt = iFitCnt;
			this._iColsCnt = iColsCnt;
			this.invalidate();
		}
	};

	ObjectPlaceholder.prototype._deregisterResizeHandler = function () {
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = "";
		}
	};

	return ObjectPlaceholder;
});
