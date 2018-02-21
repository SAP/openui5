/*!
 * ${copyright}
 */
sap.ui.define(["jquery.sap.global", "sap/ui/Device", "../UIArea"],
	function(jQuery, Device, UIArea) {
		"use strict";

		var sDraggingClass = "sapUiDnDDragging",
			oGhostContainer,
			$Indicator;

		// state information, which is valid during a drag&drop action
		// initialized on dragstart (or later), cleared again ondragend
		var oDragSession,                    // valid throughout a drag activity
			aCurrentDragInfos,               // any DragInfos configured for the currently dragged source
			oDragControl,                    // the control/element being dragged
			oValidDropControl,               // the control/element which the dragged control can be dropped on based on the current drop control
			oValidDropInfo,                  // the DragInfo with which has been determined that the dragged control is droppable on the drop control
			aCurrentDropInfosMatchingTarget, // any DropInfos matching the current target; set/updated in dragenter
			oCurrentDropControl,             // the current drop target element/control; set/updated in dragenter
			sCurrentPosition,                // the relative position to the current target item in an aggregation (On, Before, After)
			sCurrentDropEffect,              // the current drop effect (move/copy...) according to the configuration matching the current target;
											 // set/updated in dragenter
			iTargetEnteringTime,
			bDragWithinSameControl;          // indicates whether a drag operation is performed within the same control; set/updated in dragenter

		var addStyleClass = function(oElement, sStyleClass) {
			if (oElement.addStyleClass) {
				oElement.addStyleClass(sStyleClass);
			} else {
				oElement.$().addClass(sStyleClass);
			}
			return oElement;
		};

		var removeStyleClass = function(oElement, sStyleClass) {
			if (oElement.removeStyleClass) {
				oElement.removeStyleClass(sStyleClass);
			} else {
				oElement.$().removeClass(sStyleClass);
			}
			return oElement;
		};

		var createDragSession = function(oEvent) {
			var _mData = {};
			var _dataTransfer = oEvent.originalEvent.dataTransfer;

			var _setTransferData = function(sType, sData) {
				// set to original dataTransfer object if type is supported by the current browser (non-text causes error in IE+Edge)
				if (_dataTransfer && sType === "text" || (Device.browser !== "msie" && Device.browser !== "edge")) {
					_dataTransfer.setData(sType, sData);
				}
			};

			/**
			 * When a user requests to drag some controls that can be dragged, a drag session is started.
			 * The drag session can be used to transfer data between applications or between dragged and dropped controls.
			 * Please see provided APIs for more details.
			 *
			 * <b>Note:</b> This object only exists during a drag-and-drop operation.
			 *
			 * @namespace
			 * @name sap.ui.core.dnd.DragSession
			 * @static
			 * @abstract
			 * @public
			 */
			return /** @lends sap.ui.core.dnd.DragSession */ {
				/**
				 * Sets string data with any MIME type.
				 * <b>Note:</b> This works in all browsers, apart from Internet Explorer and Microsoft Edge. It also works if you navigate between
				 * different windows.
				 *
				 * @param {string} sKey The key of the data
				 * @param {string} sData Data
				 * @public
				 */
				setData: function(sKey, sData) {
					sData = "" + sData;
					_mData[sKey] = sData;
					_setTransferData(sKey, sData);
				},

				/**
				 * Returns the data that has been set via <code>setData</code> method.
				 *
				 * @param {string} sKey The key of the data
				 * @returns {string} Data
				 * @public
				 */
				getData: function(sKey) {
					return _mData[sKey];
				},

				/**
				 * Sets string data with plain text MIME type.
				 * <b>Note:</b> This works in all browsers, including Internet Explorer and Microsoft Edge. It also works if you navigate between
				 * different windows.
				 *
				 * @param {string} sData Data
				 * @public
				 */
				setTextData: function(sData) {
					sData = "" + sData;
					_mData["text/plain"] = sData;
					_mData["text"] = sData;
					_setTransferData("text/plain", sData);
					_setTransferData("text", sData);
				},

				/**
				 * Returns the data that has been set via <code>setTextData</code> method.
				 *
				 * @returns {string} Data
				 * @public
				 */
				getTextData: function() {
					return _mData["text/plain"];
				},

				/**
				 * Sets any type of data (even functions, pointers, anything non-serializable) with any MIME type.
				 * This works in all browsers, including Internet Explorer and Microsoft Edge, but only within a UI5 application within the same
				 * window/frame.
				 *
				 * @param {string} sKey The key of the data
				 * @param {any} vData Data
				 */
				setComplexData: function(sKey, vData) {
					_mData[sKey] = vData;
				},

				/**
				 * Returns the data that has been set via <code>setComplexData</code> method.
				 *
				 * @param {string} sKey The key of the data
				 * @returns {any} The previously set data or undefined
				 * @public
				 */
				getComplexData: function(sKey) {
					return _mData[sKey];
				},

				/**
				 * Returns the drop indicator.
				 *
				 * @returns {HTMLElement} Indicator's DOM reference
				 * @protected
				 */
				getIndicator: function() {
					return $Indicator && $Indicator[0];
				},

				/**
				 * The dragged control, if available within the same UI5 application frame.
				 *
				 * @protected
				 * @type sap.ui.core.Element
				 */
				draggedControl: oDragControl,

				/**
				 * The valid drop target underneath the dragged control.
				 *
				 * @protected
				 * @type sap.ui.core.Element
				 */
				dropControl: oValidDropControl
			};
		};

		var closeDragSession = function() {
			getIndicator().hide();

			if (oDragControl) {
				removeStyleClass(oDragControl, sDraggingClass);
			}

			oDragSession = undefined;
			aCurrentDragInfos = undefined;
			oDragControl = undefined;
			oValidDropControl = undefined;
			oValidDropInfo = undefined;
			aCurrentDropInfosMatchingTarget = undefined;
			oCurrentDropControl = undefined;
			sCurrentPosition = undefined;
			sCurrentDropEffect = undefined;
			iTargetEnteringTime = undefined;
			bDragWithinSameControl = undefined;
		};

		var getGhostContainer = function() {
			if (!oGhostContainer) {
				oGhostContainer = jQuery("<div class=\"sapUiDnDGhostContainer\"></div>");
				jQuery(document.body).append(oGhostContainer);
			}
			return oGhostContainer;
		};

		/**
		 * Gets the drag infos configured on the given element and its parent.
		 *
		 * @param {sap.ui.core.Element} oElement The element
		 * @param {boolean} [bIncludeDragDropInfos=false] Whether also combined drag and drop info's should be returned
		 * @returns {sap.ui.core.dnd.IDragInfo[]} The drag info's
		 */
		var getDragInfos = function(oElement, bIncludeDragDropInfos) {
			if (!oElement) {
				return [];
			}

			var aDragInfos = oElement.getDragDropConfig ? oElement.getDragDropConfig() : [];
			var aParentDragInfos = oElement.getParent() && oElement.getParent().getDragDropConfig ? oElement.getParent().getDragDropConfig() : [];

			return aDragInfos.concat(aParentDragInfos).filter(function(oDragInfo) {
				var oDragInfoMetadata = oDragInfo.getMetadata();

				if (bIncludeDragDropInfos) {
					return oDragInfoMetadata.isInstanceOf("sap.ui.core.dnd.IDragInfo");
				} else {
					return oDragInfoMetadata.isInstanceOf("sap.ui.core.dnd.IDragInfo")
						   && !oDragInfoMetadata.isInstanceOf("sap.ui.core.dnd.IDropInfo");
				}
			});
		};

		/**
		 * Checks whether an element is draggable. First asks the DragInfo and then the application by firing a <code>dragstart</code> event, on
		 * which the application can call <code>preventDefault()</code> if the element should not be draggable.
		 *
		 * @param {sap.ui.core.Element} oElement The element
		 * @param {jQuery.Event} oEvent The event
		 * @param {sap.ui.core.dnd.IDragInfo} oDragInfo The drag info
		 * @returns {boolean} Returns <code>true</code>, if the element is draggable
		 */
		var isDraggable = function(oElement, oEvent, oDragInfo) {
			return oDragInfo.getMetadata().isInstanceOf("sap.ui.core.dnd.IDragInfo")
				   && oDragInfo.isDraggable(oElement)
				   && oDragInfo.fireDragStart(oEvent, oElement);
		};

		/**
		 * Gets the drop infos configured on the given control and its parent.
		 *
		 * @param {sap.ui.core.Element} oElement The element
		 * @param {boolean} [bIncludeDragDropInfos=false] Whether also combined drag and drop info's should be returned
		 * @returns {sap.ui.core.dnd.IDropInfo[]} The drop info's
		 */
		var getDropInfos = function(oElement, bIncludeDragDropInfos) {
			if (!oElement) {
				return [];
			}

			var aDropInfos = oElement.getDragDropConfig ? oElement.getDragDropConfig() : [];
			var aParentDropInfos = oElement.getParent() && oElement.getParent().getDragDropConfig ? oElement.getParent().getDragDropConfig() : [];

			return aDropInfos.concat(aParentDropInfos).filter(function(oDragInfo) {
				var oDragInfoMetadata = oDragInfo.getMetadata();

				if (bIncludeDragDropInfos) {
					return oDragInfoMetadata.isInstanceOf("sap.ui.core.dnd.IDropInfo");
				} else {
					return oDragInfoMetadata.isInstanceOf("sap.ui.core.dnd.IDropInfo")
						   && !oDragInfoMetadata.isInstanceOf("sap.ui.core.dnd.IDragInfo");
				}
			});
		};

		/**
		 * Checks whether dropping on the element is possible. Asks the application by firing a <code>dragenter</code> event, on which the
		 * application can call <code>preventDefault()</code> if dropping on the element should not be possible. Does not call IDropInfo#isDroppable.
		 *
		 * @param {sap.ui.core.Element} oElement The element
		 * @param {jQuery.Event} oEvent The event
		 * @param {sap.ui.core.dnd.IDropInfo} oDropInfo The drop info
		 * @returns {boolean} Returns <code>true</code>, if the element is droppable
		 */
		var isDroppable = function(oElement, oEvent, oDropInfo) {
			// IDropInfo#isDroppable is checked in the dragenter event preprocessor.
			return oDropInfo.getMetadata().isInstanceOf("sap.ui.core.dnd.IDropInfo")
				   && oDropInfo.fireDragEnter(oEvent, oElement);
		};

		var DnD = {};

		DnD.preprocessEvent = function(oEvent) {
			var sEventType = oEvent.type;

			// DRAGSTART
			//
			if (sEventType === "dragstart") {
				if (!oEvent.target.draggable) {
					return;
				}

				// The text inside text input fields should still be selectable. Do not initiate DragAndDrop.
				if (/^(input|textarea)$/i.test(document.activeElement.tagName)) {
					return;
				}

				// identify the control being dragged
				oDragControl = jQuery(oEvent.target).control(0, true);

				// identify and remember the applicable DragInfos (which may or may not be DragDropInfos, having drop information as well)
				aCurrentDragInfos = getDragInfos(oDragControl, true);

				if (aCurrentDragInfos.length === 0) {
					return;
				}

				// create the drag session object and attach it to the event
				oEvent.dragSession = oDragSession = createDragSession(oEvent);

				// when supported by the browser, use a custom ghost if provided by the control
				if (!Device.browser.msie) {
					var oDragGhost = (oDragControl.getDragGhost && oDragControl.getDragGhost());
					if (oDragGhost) {
						var oGhostContainer = getGhostContainer().append(oDragGhost);
						window.setTimeout(function() { oGhostContainer.empty(); }, 0);
						// TODO: Browers can style a ghost to almost complete transparency. Consider implementing an own ghost handling.
						// TODO: set the correct position, depending on where the mouse has grabbed the element
						oEvent.originalEvent.dataTransfer.setDragImage(oDragGhost, 0, 0);
					}
				}

				// Firefox needs data set to allow dragging
				if (Device.browser.firefox && oEvent.originalEvent.dataTransfer.types.length === 0) {
					oEvent.originalEvent.dataTransfer.setData("ui5/dummyDataForFirefox", "data");
				}
			}

			// add the same dragSession object to the subsequent events
			if (/^(dragenter|dragover|dragleave|dragend|drop)$/i.test(sEventType)) {
				// not defined when something is dragged from outside the browser because dragstart and dragend are not called in this case
				oEvent.dragSession = oDragSession;
			}

			// DRAGENTER
			//
			if (sEventType === "dragenter") {
				if (!oEvent.dragSession) {
					return;
					// TODO: this happens when dragging into the browser from outside; define a session now?
				}

				// nothing to do if we remain in the same control/element
				var oDropControl = jQuery(oEvent.target).control(0, true);
				if (!oDropControl || oDropControl === oCurrentDropControl) { // we already know this target control
					bDragWithinSameControl = true;
					return;
				}
				bDragWithinSameControl = false;

				iTargetEnteringTime = Date.now();
				oCurrentDropControl = oDropControl;
				oValidDropControl = undefined;
				oEvent.dragSession.dropControl = undefined;
				oValidDropInfo = undefined;
				aCurrentDropInfosMatchingTarget = [];
				var bFoundDroppable = false;

				/* Find all potentially applicable DropInfos. */
				// Find the DropInfos configured around the current drop target.
				var aPotentialDropInfos = getDropInfos(oDropControl);
				// Add the current DragInfos, in case they also have drop information (DragDropInfo).
				aCurrentDragInfos.forEach(function(oDragInfo) {
					if (aPotentialDropInfos.indexOf(oDragInfo) === -1 && oDragInfo.getMetadata().isInstanceOf("sap.ui.core.dnd.IDropInfo")) {
						aPotentialDropInfos.push(oDragInfo);
					}
				});

				aPotentialDropInfos.forEach(function(oDropInfo) {
					var _oDropControl = oDropControl;
					if (oDropInfo.getMetadata().isInstanceOf("sap.ui.core.dnd.IDropInfo")) {
						while (_oDropControl) {
							if (oDropInfo.isDroppable(_oDropControl, oEvent.target)) {
								aCurrentDropInfosMatchingTarget.push(oDropInfo);

								// Remember the first found valid drop target and the corresponding info.
								// The control and the application are asked later whether this actually is a valid drop target.
								if (!bFoundDroppable) {
									var sTargetElementId = oDropInfo.getTargetElement();

									if (sTargetElementId && !oDropInfo.getTargetAggregation()) {
										oValidDropControl = sap.ui.getCore().byId(sTargetElementId) || _oDropControl;
									} else {
										oValidDropControl = _oDropControl;
									}

									oEvent.dragSession.dropControl = oValidDropControl;
									oValidDropInfo = oDropInfo;
									sCurrentDropEffect = oDropInfo.getDropEffect();
									oEvent.originalEvent.dataTransfer.dropEffect = sCurrentDropEffect.toLowerCase();
									bFoundDroppable = true;
								}
							}

							// Move up the control hierarchy to find a valid drop target.
							_oDropControl = _oDropControl.getParent();
						}
					}
				});

				if (aCurrentDropInfosMatchingTarget.length > 1) {
					jQuery.sap.log.warning("More than one matching drop configuration on " + oCurrentDropControl.toString() + ": "
										 + aCurrentDropInfosMatchingTarget.length);
				}
			}

			// DRAGOVER
			//
			if (sEventType === "dragover") {
				// The longdragover event should always be dispatched, even if the user is currently not dragging over a valid drop target.
				// TODO: Move to event simulation
				if (Date.now() - iTargetEnteringTime >= 1000) {
					var oLongDragOverEvent = jQuery.Event(null, oEvent);
					oLongDragOverEvent.type = "longdragover";
					var oLongDragOverControl = jQuery(oEvent.target).control(0, true);
					if (oLongDragOverControl) {
						oLongDragOverControl.getUIArea()._handleEvent(oLongDragOverEvent);
						iTargetEnteringTime = Date.now();
					}
				}

				if (!oValidDropControl) { // nothing to do if there is no droppable target
					sCurrentPosition = undefined;
					getIndicator().hide();
					return;
				}

				// maintain drop effect and keep droppable state
				oEvent.originalEvent.dataTransfer.dropEffect = sCurrentDropEffect.toLowerCase();
				oEvent.preventDefault();

				// update the drop position depending on the exact mouse position - if required
				var aTargetAndPosition = getCurrentDropPositionAndShowIndicator(oValidDropInfo, oEvent, oValidDropControl);

				if (aTargetAndPosition) {
					sCurrentPosition = aTargetAndPosition[1];
				} else {
					sCurrentPosition = undefined;
				}
			}

			// DRAGEND is handled in globally registered event handler after everything else has been completed (see postprocessEvent dragstart)
		};

		DnD.postprocessEvent = function(oEvent) {
			var sEventType = oEvent.type;

			// DRAGSTART
			//
			if (sEventType === "dragstart") {
				if (oEvent.isDefaultPrevented() || !aCurrentDragInfos) {
					aCurrentDragInfos = [];
					closeDragSession();
					return;
				}

				aCurrentDragInfos = aCurrentDragInfos.filter(isDraggable.bind(undefined, oDragControl, oEvent));
				if (aCurrentDragInfos.length === 0) {
					oEvent.preventDefault();
					closeDragSession();
					return;
				}

				// decorate the control being dragged
				addStyleClass(oDragControl, sDraggingClass);

				// do cleanup when dragging has ended
				jQuery(document).one("dragend", closeDragSession); // must be called after all UIAreas are done dispatching dragend
				// TODO: dragend is not called when dragging from outside the browser. Find out how much cleanup is required in that case and when it
				// is done.
			}

			// DRAGENTER
			//
			if (sEventType === "dragenter") {
				if (!oEvent.dragSession || bDragWithinSameControl) {
					return;
				}

				if (oEvent.isDefaultPrevented() || oValidDropControl && !isDroppable(oValidDropControl, oEvent, oValidDropInfo)) {
					oValidDropControl = undefined;
					oValidDropInfo = undefined;
					oEvent.dragSession.dropControl = undefined;
				}

				if (oValidDropControl) {
					oEvent.preventDefault();
					// TODO: The drop effect (dataTransfer.dropEffect) might have been modified. Update sCurrentDropEffect.
				} else {
					sCurrentDropEffect = "None";
					oEvent.originalEvent.dataTransfer.dropEffect = "none";
				}
			}

			// DROP
			//
			if (sEventType === "drop") {
				if (oValidDropControl && oValidDropInfo) {
					oValidDropInfo.fireDrop(oEvent, sCurrentPosition);
				}
				closeDragSession();
			}

			// DRAGEND is handled in globally registered event handler after everything else has been completed (see postprocessEvent dragstart)
		};

		UIArea.addEventPreprocessor(DnD.preprocessEvent);
		UIArea.addEventPostprocessor(DnD.postprocessEvent);

		var getCurrentDropPositionAndShowIndicator = function(oDropInfo, oEvent, oDropControl) {
			// TODO: For single aggregations (multiple=false) the drop position should also default to "On"
			var sTargetAggregation = oDropInfo.getTargetAggregation();
			if (!sTargetAggregation) { // entire control is target -> drop position should be "On"
				showIndicator(oEvent, oDropControl.getDomRef(), "On");
				return [oDropControl, "On"];
			}

			var oTargetDomRef, sDropPosition = oDropInfo.getDropPosition();
			if (oDropControl.getAggregationDomRef) {
				oTargetDomRef = oDropControl.getAggregationDomRef(sTargetAggregation);
				sDropPosition = "On";
			}
			if (!oTargetDomRef) {
				oTargetDomRef = oDropControl.getDomRef();
			}
			var sDropPositionRelativeToItem = showIndicator(oEvent, oTargetDomRef, sDropPosition, oDropInfo.getDropLayout());
			return [oDropControl, sDropPositionRelativeToItem];
		};

		var showIndicator = function(oEvent, oDropTarget, sDropPosition, sDropLayout) {
			var sConfiguredDropPosition = sDropPosition,
				mClientRect = oDropTarget.getBoundingClientRect(),
				iPageYOffset = window.pageYOffset,
				iPageXOffset = window.pageXOffset,
				oIndicator = getIndicator(),
				sDropPositionRelativeToItem,
				mDropRect = {
					top: mClientRect.top + iPageYOffset,
					bottom: mClientRect.bottom + iPageYOffset,
					left: mClientRect.left + iPageXOffset,
					right: mClientRect.right + iPageXOffset,
					width: mClientRect.width,
					height: mClientRect.height
				};

			if (sDropLayout == "Horizontal") {
				oIndicator.attr("data-drop-layout", "horizontal")
						  .css("height", mDropRect.height)
						  .css("top", mDropRect.top);

				var iCursorX = oEvent.pageX - mDropRect.left;

				if (sConfiguredDropPosition === "Between") {
					oIndicator.attr("data-drop-position", "between")
							  .css("width", "");
					if (iCursorX < mDropRect.width * 0.5) {
						oIndicator.css("left", mDropRect.left);
						sDropPositionRelativeToItem = "Before";
					} else {
						oIndicator.css("left", mDropRect.right);
						sDropPositionRelativeToItem = "After";
					}
				} else if (sConfiguredDropPosition === "OnOrBetween") {
					if (iCursorX < mDropRect.width * 0.25) {
						oIndicator.attr("data-drop-position", "between")
								  .css("left", mDropRect.left)
								  .css("width", "");
						sDropPositionRelativeToItem = "Before";
					} else if (iCursorX > mDropRect.width * 0.75) {
						oIndicator.attr("data-drop-position", "between")
								  .css("left", mDropRect.right)
								  .css("width", "");
						sDropPositionRelativeToItem = "After";
					} else {
						sDropPositionRelativeToItem = "On";
					}
				}
			} else { // Vertical dragging
				oIndicator.attr("data-drop-layout", "vertical")
						  .css("width", mDropRect.width)
						  .css("left", mDropRect.left);

				var iCursorY = oEvent.pageY - mDropRect.top;

				if (sConfiguredDropPosition === "Between") {
					oIndicator.attr("data-drop-position", "between")
							  .css("height", "");
					if (iCursorY < mDropRect.height * 0.5) { // TODO: feels more natural when not the mouse position, but the center of the dragged ghost is used
						oIndicator.css("top", mDropRect.top);
						sDropPositionRelativeToItem = "Before";
					} else {
						oIndicator.css("top", mDropRect.bottom);
						sDropPositionRelativeToItem = "After";
					}
				} else if (sConfiguredDropPosition === "OnOrBetween") {
					if (iCursorY < mDropRect.height * 0.25) {
						oIndicator.attr("data-drop-position", "between")
								  .css("top", mDropRect.top)
								  .css("height", "");
						sDropPositionRelativeToItem = "Before";
					} else if (iCursorY > mDropRect.height * 0.75) {
						oIndicator.attr("data-drop-position", "between")
								  .css("top", mDropRect.bottom)
								  .css("height", "");
						sDropPositionRelativeToItem = "After";
					} else {
						sDropPositionRelativeToItem = "On";
					}
				}
			}

			if (sConfiguredDropPosition === "On" || sDropPositionRelativeToItem === "On") {
				sDropPositionRelativeToItem = "On"; // Might not have been set previously, so do it here.
				oIndicator.attr("data-drop-position", "on")
						  .css("top", mDropRect.top)
						  .css("left", mDropRect.left)
						  .css("height", mDropRect.height)
						  .css("width", mDropRect.width);
			}

			oIndicator.show();

			return sDropPositionRelativeToItem;
		};

		var getIndicator = function() {
			if ($Indicator) {
				return $Indicator;
			}

			$Indicator = jQuery("<div class=\"sapUiDnDIndicator\"></div>");
			jQuery(sap.ui.getCore().getStaticAreaRef()).append($Indicator);
			return $Indicator;
		};

		return DnD;

	}, /* bExport= */ true);