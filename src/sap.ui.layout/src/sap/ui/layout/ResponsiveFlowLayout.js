/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.ResponsiveFlowLayout.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/IntervalTrigger', 'sap/ui/core/theming/Parameters', './ResponsiveFlowLayoutData', './library'],
	function(jQuery, Control, IntervalTrigger, Parameters, ResponsiveFlowLayoutData, library) {
	"use strict";



	/**
	 * Constructor for a new ResponsiveFlowLayout.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This is a layout where several controls can be added. These controls are blown up to fit in an entire row. If the window resizes, the controls are moved between the rows and resized again.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.layout.ResponsiveFlowLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ResponsiveFlowLayout = Control.extend("sap.ui.layout.ResponsiveFlowLayout", /** @lends sap.ui.layout.ResponsiveFlowLayout.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * If set to false, all added controls will keep their width, or otherwise, the controls will be stretched to the possible width of a row.
			 */
			responsive : {type : "boolean", group : "Misc", defaultValue : true}
		},
		defaultAggregation : "content",
		aggregations : {

			/**
			 * Added content that should be positioned. Every content item should have a ResponsiveFlowLayoutData attached, or otherwise, the default values are used.
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
		}
	}});


	(function() {
		ResponsiveFlowLayout.prototype.init = function() {
			this._rows = [];

			this._bIsRegistered = false;
			this._proxyComputeWidths = jQuery.proxy(computeWidths, this);

			this._iRowCounter = 0;
		};
		ResponsiveFlowLayout.prototype.exit = function() {
			delete this._rows;

			if (this._IntervalCall) {
				jQuery.sap.clearDelayedCall(this._IntervalCall);
				this._IntervalCall = undefined;
			}

			if (this._resizeHandlerComputeWidthsID) {
				sap.ui.core.ResizeHandler.deregister(this._resizeHandlerComputeWidthsID);
			}
			delete this._resizeHandlerComputeWidthsID;
			delete this._proxyComputeWidths;

			if (this.oRm) {
				this.oRm.destroy();
				delete this.oRm;
			}

			delete this._$DomRef;
			delete this._oDomRef;

			delete this._iRowCounter;
		};

		var updateRows = function(oThis) {
			var aControls = oThis.getContent();
			var aRows = [];
			var iRow = -1;
			var oItem = {}, oLast = {};
			var sId = "";
			var oLD;
			var minWidth = 0, weight = 0, length = 0;
			var bBreak = false, bMargin = false, bLinebreakable = false;

			for (var i = 0; i < aControls.length; i++) {
				// use default values -> are overwritten if LayoutData exists
				minWidth = ResponsiveFlowLayoutData.MIN_WIDTH;
				weight = ResponsiveFlowLayoutData.WEIGHT;
				bBreak = ResponsiveFlowLayoutData.LINEBREAK;
				bMargin = ResponsiveFlowLayoutData.MARGIN;
				bLinebreakable = ResponsiveFlowLayoutData.LINEBREAKABLE;

				// set the values of the layout data if available
				oLD = _getLayoutDataForControl(aControls[i]);
				if (oLD instanceof ResponsiveFlowLayoutData) {
					bBreak = oLD.getLinebreak();
					minWidth = oLD.getMinWidth();
					weight = oLD.getWeight();
					bMargin = oLD.getMargin();
					bLinebreakable = oLD.getLinebreakable();
				}

				if (iRow < 0 || bBreak) {
					/*
					 * if first run OR current control should cause a line break, the
					 * control will be placed in a new row
					 */
					iRow++;
					aRows.push({
						height : -1,
						cont : []
					});
				}

				length = aRows[iRow].cont.length;
				sId = aControls[i].getId() + "-cont" + iRow + "_" + length;
				oItem = {
					minWidth : minWidth,
					weight : weight,
					linebreakable : bLinebreakable,
					// since the margin of the element is used outside of it
					// becomes padding
					padding : bMargin,
					control : aControls[i],
					id : sId,
					breakWith : []
				};

				// check if item has been pushed -> needed if no element was found that
				// is allowed to be wrapped into a new line
				var bPushed = false;
				if (!bLinebreakable) {
					// if an element mustn't break -> find any previous element that
					// is allowed to do wrapping
					for (var br = length; br > 0; br--) {
						oLast = aRows[iRow].cont[br - 1];
						if (oLast.linebreakable) {
							oLast.breakWith.push(oItem);
							bPushed = true;
							break;
						}
					}
				}

				if (!bPushed) {
					aRows[iRow].cont.push(oItem);
				}

			}

			oThis._rows = aRows;
		};

		var getCurrentWrapping = function(oRow, $Row, oThis) {
			var r = [];
			var lastOffsetLeft = 10000000;
			var currentRow = -1;

			var fnCurrentWrapping = function(j) {
				var $cont = jQuery.sap.byId(oRow.cont[j].id);
				if ($cont.length > 0) {
					var offset = $cont[0].offsetLeft;
					if (lastOffsetLeft >= offset) {
						r.push({
							cont : []
						});
						currentRow++;
					}
					lastOffsetLeft = offset;
					r[currentRow].cont.push(oRow.cont[j]);
				}
			};

			// Find out the "rows" within a row
			if (sap.ui.getCore().getConfiguration().getRTL()) {
				// for RTL-mode the elements have to be checked the other way round
				for (var i = oRow.cont.length - 1; i >= 0; i--) {
					fnCurrentWrapping(i);
				}
			} else {
				for (var i = 0; i < oRow.cont.length; i++) {
					fnCurrentWrapping(i);
				}
			}

			return r;
		};

		/**
		 * Returns the target wrapping.
		 * @param {object}
		 *            [oRow] The corresponding row of possible controls
		 * @param {int}
		 *            [iWidth] The width of the row in pixels
		 *
		 */
		var getTargetWrapping = function(oRow, iWidth) {
			/*
			 * initiating all required variables to increase speed and memory
			 * efficiency
			 */
			var r = [];
			var currentRow = -1;
			var currentWidth = 0;
			var totalWeight = 0;
			var indexLinebreak = 0;
			var w1 = 0, w2 = 0;
			var j = 0, k = 0;

			// Find out the "rows" within a row
			for (j = 0; j < oRow.cont.length; j++) {
				currentWidth = 0;
				totalWeight = 0;
				for (k = indexLinebreak; k <= j; k++) {
					totalWeight = totalWeight + oRow.cont[k].weight;
				}
				for (k = indexLinebreak; k <= j; k++) {
					w1 = iWidth / totalWeight * oRow.cont[k].weight;
					w1 = Math.floor(w1);

					w2 = oRow.cont[k].minWidth;

					currentWidth += Math.max(w1, w2);
				}

				if (currentRow == -1 || currentWidth > iWidth) {
					r.push({
						cont : []
					});
					if (currentRow !== -1) {
						/*
						 * if this is NOT the first run -> all coming iterations
						 * needn't to start from '0' since the calculation of a new
						 * row has begun
						 */
						indexLinebreak = j;
					}
					currentRow++;
				}
				r[currentRow].cont.push(oRow.cont[j]);
			}
			return r;
		};

		var checkWrappingDiff = function(wrap1, wrap2) {
			if (wrap1.length != wrap2.length) {
				return true;
			}

			for (var i = 0; i < wrap1.length; i++) {
				if (wrap1[i].cont.length != wrap2[i].cont.length) {
					return true;
				}
			}

			return false;
		};

		/**
		 * Creates the corresponding content of the targeted wrapping and pushes it
		 * to the RenderManager instance.
		 *
		 * @param {object}
		 *            [oTargetWrapping] The targeted wrapping (may differ
		 *            from current wrapping)
		 * @param {int}
		 *            [iWidth] The available inner width of the row
		 * @private
		 */
		ResponsiveFlowLayout.prototype.renderContent = function(oTargetWrapping, iWidth) {
			var r = oTargetWrapping,
				iRowProcWidth = 0,
				aWidths = [],
				i = 0, ii = 0, j = 0, jj = 0,
				totalWeight = 0,
				iProcWidth = 0,
				oCont,
				tWeight = 0, tMinWidth = 0,
				aBreakWidths = [],
				aClasses = [],
				sId = this.getId(),
				sHeaderId = "",
				oRm = this._getRenderManager();

			for (i = 0; i < r.length; i++) {
				/*
				 * reset all corresponding values for each row
				 */
				iProcWidth = 0;
				aWidths.length = 0;
				iRowProcWidth = 100; // subtract the used values from a whole row
				aClasses.length = 0;

				aClasses.push("sapUiRFLRow");
				if (r[i].cont.length <= 1) {
					aClasses.push("sapUiRFLCompleteRow");
				}
				var sRowId = sId + "-row" + this._iRowCounter;
				var oStyles = {};
				oRm.writeHeader(sRowId, oStyles, aClasses);

				totalWeight = 0;
				for (ii = 0; ii < r[i].cont.length; ii++) {
					totalWeight += r[i].cont[ii].weight;
				}

				for (j = 0; j < r[i].cont.length; j++) {
					oCont = r[i].cont[j];
					tWeight = 0;
					tMinWidth = 0;

					if (oCont.breakWith.length > 0) {
						tWeight = oCont.weight;
						tMinWidth = oCont.minWidth;
						for (var br = 0; br < oCont.breakWith.length; br++) {
							tWeight += oCont.breakWith[br].weight;
							tMinWidth += oCont.breakWith[br].minWidth;
						}
					}

					/*
					 * Render Container
					 */
					sHeaderId = r[i].cont[j].id;
					aClasses.length = 0;
					// clear all other values from the object
					oStyles = {
						// the unit "px" is added below to be able to calculate with
						// the value of min-width
						"min-width" : oCont.breakWith.length > 0 ? tMinWidth : oCont.minWidth
					};

					iProcWidth = 100 / totalWeight * oCont.weight;
					var iProcMinWidth = oStyles["min-width"] / iWidth * 100;
					// round the values BEFORE they are used for the percentage value
					// because if the un-rounded values don't need the percentage
					// value
					// of the min-width, the percentage value of the calculated width
					// might be lower
					// after it is floored.
					var iPMinWidth = Math.ceil(iProcMinWidth);
					var iPWidth = Math.floor(iProcWidth);
					if (iPWidth !== 100 && iPMinWidth > iPWidth) {
						// if the percentage of the element's width will lead
						// into a too small element, use the corresponding
						// percentage value of the min-width
						iProcWidth = iPMinWidth;
					} else {
						iProcWidth = iPWidth;
					}

					// check how many percentage points are still left. If there
					// are less available than calculated, just use the rest of
					// the row
					iProcWidth = iRowProcWidth < iProcWidth ? iRowProcWidth : iProcWidth;

					iRowProcWidth -= iProcWidth;
					aWidths.push(iProcWidth);

					// if possible, percentage amount is not 0% and this is the
					// last item
					if (iRowProcWidth > 0 && j === (r[i].cont.length - 1)) {
						iProcWidth += iRowProcWidth;
					}

					aClasses.push("sapUiRFLContainer");
					oStyles["width"] = iProcWidth + "%";
					oStyles["min-width"] = oStyles["min-width"] + "px";
					oRm.writeHeader(sHeaderId, oStyles, aClasses);

					/*
					 * content rendering (render control)
					 */
					aClasses.length = 0;
					aClasses.push("sapUiRFLContainerContent");
					if (oCont.breakWith.length > 0) {
						aClasses.push("sapUiRFLMultiContainerContent");
					}
					if (oCont.padding) {
						aClasses.push("sapUiRFLPaddingClass");
					}

					var sClass = this._addContentClass(oCont.control, j);
					if (sClass) {
						aClasses.push(sClass);
					}

					oStyles = {};
					oRm.writeHeader("", oStyles, aClasses);

					/*
					 * Render all following elements into same container if there
					 * are any that should wrap together with container. Otherwise, simply
					 * render the control.
					 */
					if (oCont.breakWith.length > 0) {
						/*
						 * Render first element of wrap-together-group
						 */
						sHeaderId = r[i].cont[j].id + "-multi0";
						aClasses.length = 0;
						oStyles = {
							"min-width" : tMinWidth + "px"
						};
						// set width of first element
						var percW = 100 / tWeight * oCont.weight;
						percW = Math.floor(percW);
						aBreakWidths.push(percW);

						aClasses.push("sapUiRFLMultiContent");
						oStyles["width"] = percW + "%";

						if (r[i].cont[j].padding) {
							aClasses.push("sapUiRFLPaddingClass");
						}
						oRm.writeHeader(sHeaderId, oStyles, aClasses);

						// total percentage for all elements
						var tPercentage = percW;

						oRm.renderControl(oCont.control);
						oRm.write("</div>");

						/*
						 * Render all following elements that should wrap with the
						 * trailing one
						 */
						for (jj = 0; jj < oCont.breakWith.length; jj++) {
							sHeaderId = oCont.breakWith[jj].id + '-multi' + (jj + 1);
							aClasses.length = 0;
							oStyles = {
								"min-width" : oCont.breakWith[jj].minWidth + "px"
							};

							percW = 100 / tWeight * oCont.breakWith[jj].weight;
							percW = Math.floor(percW);

							aBreakWidths.push(percW);
							tPercentage += percW;

							// if percentage is not 100% and this is the last
							// item
							if (tPercentage < 100 && jj === (oCont.breakWith.length - 1)) {
								percW += 100 - tPercentage;
							}

							aClasses.push("sapUiRFLMultiContent");
							oStyles["width"] = percW + "%";

							if (oCont.breakWith[jj].padding) {
								aClasses.push("sapUiRFLPaddingClass");
							}
							oRm.writeHeader(sHeaderId, oStyles, aClasses);

							oRm.renderControl(oCont.breakWith[jj].control);
							oRm.write("</div>");
						}
					} else {
						oRm.renderControl(oCont.control);
					}
					oRm.write("</div>"); // content

					oRm.write("</div>"); // container
				}
				oRm.write("</div>"); // row

				this._iRowCounter++;
			}
		};

		var computeWidths = function(bInitial) {
			this._iRowCounter = 0;

			this._oDomRef = this.getDomRef();
			if (this._oDomRef) {
				var sId = this.getId();
				var iInnerWidth = jQuery(this._oDomRef).width(); //width without the padding
				var bRender = false;

				if (this._rows) {
					for (var i = 0; i < this._rows.length; i++) {
						var $Row = this._$DomRef.find("#" + sId + "-row" + i);

						var oTargetWrapping = getTargetWrapping(this._rows[i], iInnerWidth);
						var oCurrentWrapping = getCurrentWrapping(this._rows[i], $Row, this);

						// render if wrapping differs
						bRender = checkWrappingDiff(oCurrentWrapping, oTargetWrapping);

						// if the width/height changed so the sizes need to be
						// recalculated
						var oRowRect = this._getElementRect($Row);
						var oPrevRect = this._rows[i].oRect;

						if (oRowRect && oPrevRect) {
							bRender = bRender || (oRowRect.width !== oPrevRect.width) && (oRowRect.height !== oPrevRect.height);
						}

						// if this should be the initial rendering -> do it
						bRender = bRender || (typeof (bInitial) === "boolean" && bInitial);

						if (this._bLayoutDataChanged || bRender) {

							//in IE when setting the innerHTML property to "" the changes do not take effect correctly and all the children are gone
							if (sap.ui.Device.browser.internet_explorer){
								jQuery(this._oDomRef).empty();
							} else {
								this._oDomRef.innerHTML = "";
							}

							// reset this to be clean for next check interval
							this._bLayoutDataChanged = false;
							this.renderContent(oTargetWrapping, iInnerWidth);
						}
					}

					if (this._oDomRef.innerHTML === "") {
						this._getRenderManager().flush(this._oDomRef);

						for (var i = 0; i < this._rows.length; i++) {
							var oTmpRect = this._getElementRect(jQuery.sap.byId(sId + "-row" + i));
							this._rows[i].oRect = oTmpRect;
						}
					}

					if (this._rows.length === 0) {
						if (this._resizeHandlerComputeWidthsID) {
							sap.ui.core.ResizeHandler.deregister(this._resizeHandlerComputeWidthsID);
							delete this._resizeHandlerComputeWidthsID;
						}
					}
				}
			}
		};

		/**
		 * Handles the internal event onBeforeRendering.
		 * Before all controls are rendered, the internal structure of the rows needs to be updated.
		 *
		 */
		ResponsiveFlowLayout.prototype.onBeforeRendering = function() {
			// update the internal structure of the rows
			updateRows(this);

			if (this._resizeHandlerFullLengthID) {
				sap.ui.core.ResizeHandler.deregister(this._resizeHandlerFullLengthID);
				delete this._resizeHandlerFullLengthID;
			}
		};

		/**
		 * Handles the internal event onAfterRendering.
		 * If the layout should be responsive, it is necessary to fix the width of the content
                 * items to correspond to the width of the layout.
		 */
		ResponsiveFlowLayout.prototype.onAfterRendering = function(oEvent) {
			this._oDomRef = this.getDomRef();
			this._$DomRef = jQuery(this._oDomRef);

			// Initial Width Adaptation
			this._proxyComputeWidths(true);

			if (this.getResponsive()) {
				if (!this._resizeHandlerComputeWidthsID) {
					this._resizeHandlerComputeWidthsID = sap.ui.core.ResizeHandler.register(this, this._proxyComputeWidths);
				}
			} else {
				if (this._resizeHandlerComputeWidthsID) {
					sap.ui.core.ResizeHandler.deregister(this._resizeHandlerComputeWidthsID);
					delete this._resizeHandlerComputeWidthsID;
				}
			}
		};

		ResponsiveFlowLayout.prototype.onThemeChanged = function(oEvent) {
			if (oEvent.type === "LayoutDataChange") {
				this._bLayoutDataChanged = true;
			}
			if (!this._resizeHandlerComputeWidthsID) {
				this._resizeHandlerComputeWidthsID = sap.ui.core.ResizeHandler.register(this, this._proxyComputeWidths);
			}

			updateRows(this);
			this._proxyComputeWidths();
		};

		/**
		 * If any LayoutData was changed, the same logic should be applied as in onThemeChanged.
		 */
		ResponsiveFlowLayout.prototype.onLayoutDataChange = ResponsiveFlowLayout.prototype.onThemeChanged;

		var _getLayoutDataForControl = function(oControl) {
			var oLayoutData = oControl.getLayoutData();

			if (!oLayoutData) {
				return undefined;
			} else if (oLayoutData instanceof ResponsiveFlowLayoutData) {
				return oLayoutData;
			} else if (oLayoutData.getMetadata().getName() == "sap.ui.core.VariantLayoutData") {
				// multiple LayoutData available - search here
				var aLayoutData = oLayoutData.getMultipleLayoutData();
				for (var i = 0; i < aLayoutData.length; i++) {
					var oLayoutData2 = aLayoutData[i];
					if (oLayoutData2 instanceof ResponsiveFlowLayoutData) {
						return oLayoutData2;
					}
				}
			}
		};

		/**
		 * Adds content.
		 * This function needs to be overridden to prevent any rendering while some
		 * content is still being added.
		 *
		 * @param {sap.ui.core.Control}
		 *            oContent The content that should be added to the layout
		 * @public
		 */
		ResponsiveFlowLayout.prototype.addContent = function(oContent) {
			if (oContent && this._IntervalCall) {
				jQuery.sap.clearDelayedCall(this._IntervalCall);
				this._IntervalCall = undefined;
			}
			this.addAggregation("content", oContent);
		};

		/**
		 * Inserts content.
		 * This function needs to be overridden to prevent any rendering while some
		 * content is still being added.
		 *
		 * @param {sap.ui.core.Control}
		 *            oContent The content that should be inserted to the layout
		 * @param {int}
		 *            iIndex The index where the content should be inserted into
		 * @public
		 */
		ResponsiveFlowLayout.prototype.insertContent = function(oContent, iIndex) {
			if (oContent && this._IntervalCall) {
				jQuery.sap.clearDelayedCall(this._IntervalCall);
				this._IntervalCall = undefined;
			}
			this.insertAggregation("content", oContent, iIndex);
		};

		/**
		 * Removes content.
		 * This function needs to be overridden to prevent any rendering while some
		 * content is still being added.
		 *
		 * @param {int|string|sap.ui.core.Control}
		 *            oContent The content that should be removed from the layout
		 * @returns {sap.ui.core.Control} The <code>this</code> pointer for chaining
		 * @public
		 */
		ResponsiveFlowLayout.prototype.removeContent = function(oContent) {
			if (oContent && this._IntervalCall) {
				jQuery.sap.clearDelayedCall(this._IntervalCall);
				this._IntervalCall = undefined;
			}
			this.removeAggregation("content", oContent);
		};

		/**
		 * Gets the role used for accessibility.
		 * Set by the Form control if ResponsiveFlowLayout represents a FormContainer.
		 * @return {string} sRole Accessibility role
		 * @since 1.28.0
		 * @private
		 */
		ResponsiveFlowLayout.prototype._getAccessibleRole = function() {

			return null;

		};

		/**
		 * Sets a class at the content container
		 * Set by the Form control if ResponsiveFlowLayout represents a FormElement.
		 * @return {string} sClass CSS class
		 * @since 1.28.22
		 * @private
		 */
		ResponsiveFlowLayout.prototype._addContentClass = function(oControl, iIndex) {

			return null;

		};

		/**
		 * Returns a rectangle describing the current visual positioning of 1st DOM in the collection.
		 * The difference with the function rect() in jQuery.sap.dom.js is that the height and width are cut to the
		 * 1st digit after the decimal separator and this is consistent across all browsers.
		 * @param oElement the jQuery collection to check
		 * @returns {{top, left, width, height}} or null if no such element
		 * @private
		 */
		ResponsiveFlowLayout.prototype._getElementRect = function (oElement) {
			var oRect = oElement && oElement.rect();

			if (oRect) {
				oRect.height = oRect.height.toFixed(1);
				oRect.width = oRect.width.toFixed(1);
			}
			return oRect;
		};

		/**
		 * Lazily obtains custom version of render manager
		 * @private
		 * @returns {sap.ui.core.RenderManager} instance of render manager.
		 * Note: the instance is also available as <code>this.oRm</code>
		 */
		ResponsiveFlowLayout.prototype._getRenderManager = function () {
			if (!this.oRm) {
				this.oRm = sap.ui.getCore().createRenderManager();
				this.oRm.writeStylesAndClasses = function() {
					this.writeStyles();
					this.writeClasses();
				};
				this.oRm.writeHeader = function(sId, oStyles, aClasses) {
					this.write('<div id="' + sId + '"');

					if (oStyles) {
						for ( var key in oStyles) {
							if (key === "width" && oStyles[key] === "100%") {
								this.addClass("sapUiRFLFullLength");
							}
							this.addStyle(key, oStyles[key]);
						}
					}
					for (var i = 0; i < aClasses.length; i++) {
						this.addClass(aClasses[i]);
					}

					this.writeStylesAndClasses();
					this.write(">");
				};
			}
			return this.oRm;
		};

	}());

	return ResponsiveFlowLayout;

}, /* bExport= */ true);
