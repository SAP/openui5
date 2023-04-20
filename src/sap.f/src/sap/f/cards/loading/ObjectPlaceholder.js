/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/cards/loading/PlaceholderBase",
	"./ObjectPlaceholderRenderer",
	"sap/ui/core/ResizeHandler",
	"sap/ui/dom/units/Rem"
], function (
	PlaceholderBase,
	ObjectPlaceholderRenderer,
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
	var ObjectPlaceholder = PlaceholderBase.extend("sap.f.cards.loading.ObjectPlaceholder", {
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
		renderer: ObjectPlaceholderRenderer
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
