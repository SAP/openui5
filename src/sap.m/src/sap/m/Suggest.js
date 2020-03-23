/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Bar', './Button', './SuggestionsList', './SuggestionItem', 'sap/ui/Device', 'sap/m/library'],
	function(jQuery, Bar, Button, SuggestionsList, SuggestionItem, Device, library) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	/**
	 * <code>sap.m.Suggest</code> provides the functionality to display suggestion lists for the user entry
	 * in a search field.
	 *
	 * This function is part of the sap.m.SearchField functionality.
	 * It should not be used in application programming as a stand alone unit.
	 *
	 * @author SAP SE
	 * @since 1.34
	 *
	 * @private
	 * @alias sap.m.Suggest
	 *
	 * @param {sap.ui.core.Control} oInput the search/input control to which this suggestion belongs
	 *
	 * @constructor
	 */
	function Suggest(oInput) {

		var parent = oInput, 		// the parent search field/input
			picker, 				// either or popover or a dialog with the list of suggestion items
			list,					// SuggestionsList with suggestions
			listUpdateTimeout,		// list is updated after a timeout to accumulate simultaneous updates
			bUseDialog = Device.system.phone,
			self = this;

		// 1. Conditional loading depending on the device type.
		// 2. Resolve circular dependency Dialog -> OverflowToolbar -> SearchField:
		//TODO: global jquery call found
		jQuery.sap.require(bUseDialog ? "sap.m.Dialog" : "sap.m.Popover");

		/* =========================================================== */
		/* events processing                                           */
		/* =========================================================== */

		// Process tap over a list item in a picker
		function ontap(oEvent) {
			var item = oEvent.srcControl;
			var value;
			if (item instanceof SuggestionItem ) {
				value = item.getSuggestionText();
				self._suggestionItemTapped = true;
				picker.close();
				window.setTimeout(function() {
					oInput.setValue(value);
					oInput.fireSearch({
						query: value,
						suggestionItem: item,
						refreshButtonPressed: false,
						clearButtonPressed: false
					});
				}, 0);
			}
		}

		/* =========================================================== */
		/* internal helper functions                                   */
		/* =========================================================== */

		function createDialog() {
			var dialog,
				originalValue,
				dialogSearchField,
				customHeader,
				closeButton;

			// use sap.ui.require to avoid circular dependency between the SearchField and Suggest
			dialogSearchField = new (sap.ui.require('sap/m/SearchField'))({
				liveChange : function (oEvent) {
					var value = oEvent.getParameter("newValue");
					oInput.setValue(value);
					oInput.fireLiveChange({newValue: value});
					oInput.fireSuggest({suggestValue: value});
					self.update();
				},
				search : function (oEvent) {
					if (!oEvent.getParameter("clearButtonPressed")) {
						dialog.close();
					}
				}
			});

			customHeader = new Bar({
				contentLeft: dialogSearchField
			});

			closeButton = new Button({
				text : sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("MSGBOX_CANCEL"),
				press : function() {
					dialog._oCloseTrigger = true;
					dialog.close();
				}
			});

			dialog = new (sap.ui.require('sap/m/Dialog'))({
				stretch: true,
				customHeader: customHeader,
				content: getList(),
				beginButton : closeButton,
				beforeOpen: function() {
					originalValue = oInput.getValue();
					dialogSearchField.setValue(originalValue);
				},
				beforeClose: function(oEvent) {
					if (oEvent.getParameter("origin")) {
						// Cancel button: set original value
						oInput.setValue(originalValue);
					} else { // set current value
						oInput.setValue(dialogSearchField.getValue());
					}

					oInput._bSuggestionSuppressed = true;
				},
				afterClose: function(oEvent) {
					if (!oEvent.getParameter("origin")  // fire the search event if not cancelled
						&& !self._suggestionItemTapped) { // and if not closed from item tap

						oInput.fireSearch({
							query: oInput.getValue(),
							refreshButtonPressed: false,
							clearButtonPressed: false
						});
					}
				}
			});
			dialog.addEventDelegate({
				ontap: ontap
			}, oInput);
			return dialog;
		}

		function createPopover() {
			var popover = self._oPopover =  new (sap.ui.require('sap/m/Popover'))({
				showArrow: false,
				showHeader: false,
				horizontalScrolling: false,
				placement: PlacementType.Vertical,
				offsetX: 0,
				offsetY: 0,
				initialFocus: parent,
				bounce: false,
				afterOpen: function () {
					oInput.$("I").attr("aria-autocomplete","list").attr("aria-haspopup","true");
				},
				beforeClose: function() {
					oInput.$("I").attr("aria-haspopup","false").removeAttr("aria-activedecendant");
				},
				content: getList()
			})
				.addStyleClass("sapMSltPicker")
				.addStyleClass("sapMSltPicker-CTX");

			popover.open = function(){
				return this.openBy(parent);
			};

			popover.addEventDelegate({
					onAfterRendering: self.setPopoverMinWidth.bind(self),
					ontap: ontap
				}, oInput);

			return popover;
		}

		function getList() {
			if (!list) {
				list = new SuggestionsList({ parentInput: parent });
			}
			return list;
		}

		function getPicker() {
			if (picker === undefined) {
				picker = bUseDialog ? createDialog() : createPopover();
			}
			return picker;
		}

		/* =========================================================== */
		/* API functions                                               */
		/* =========================================================== */

		this.setPopoverMinWidth = function() {
			var oPopoverDomRef = self._oPopover.getDomRef();
			if (oPopoverDomRef) {
				var w = (oInput.$().outerWidth() / parseFloat(library.BaseFontSize)) + "rem";
				oPopoverDomRef.style.minWidth = w;
			}
		};

		this.destroy = function() {
			if (picker) {
				picker.close();
				picker.destroy();
				picker = null;
			}
			if (list) {
				list.destroy();
				list = null;
			}
		};

		/**
		 * Hide suggestions on desktop and tablets.
		 *
		 * Note: This function does nothing on phone devices where a full screen dialog is opened.
		 * Only the user may close the full screen dialog. There is no possibility to do it from the application code.
		 *
		 * @private
		 */
		this.close = function() {
			if (!bUseDialog && this.isOpen()) {
				picker.close();
			}
		};

		/**
		 * Show suggestions.
		 *
		 * @private
		 */
		this.open = function() {
			if (!this.isOpen()) {
				this.setSelected(-1); // clear selection before open
				this._suggestionItemTapped = false;
				getPicker().open();
			}
		};

		/**
		 * Update the suggestions list display.
		 *
		 * @private
		 */
		this.update = function() {
			var list = getList();
			window.clearTimeout(listUpdateTimeout);
			if (this.isOpen()) { // redraw the list only if it is visible
				listUpdateTimeout = window.setTimeout(list.update.bind(list), 50);
			}
		};

		/**
		 * @returns {boolean} true if the suggestions list is visible.
		 * @private
		 */
		this.isOpen = function() {
			return !!picker && picker.isOpen();
		};

		/**
		 * Getter for the selected item index.
		 *
		 * @returns {int} Index of the selected item or -1
		 * @private
		 */
		this.getSelected = function() {
			return getList().getSelectedItemIndex();
		};

		/**
		 * Setter for the selected item index.
		 *
		 * @param {int} index Index of the item to select or -1 to remove selection
		 * @private
		 */
		this.setSelected = function(index, bRelative) {
			return getList().selectByIndex(index, bRelative);
		};

	}/* Suggest */

	return Suggest;

}, /* bExport= */ true);