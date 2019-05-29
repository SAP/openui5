sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/dnd/DragInfo',
	'sap/ui/core/dnd/DropInfo'
], function (Controller, JSONModel, jQuery, DragInfo, DropInfo) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.dnd3", {

		$dragItem: null,
		$indicator: jQuery("<div class='dndIndicatorBox'></div>"),


		onAfterRendering: function () {

			jQuery(".sapFGridContainer").on("dragover", this.onDragOver.bind(this));

			jQuery(".sapFGridContainer .sapFGridContainerItemWrapper").each(function (iInd, oItem) {
				var $item = jQuery(oItem);

				$item.attr("draggable", true);
				$item.addClass("dndDraggableItem");

				$item
					.on("dragstart", this.onDragStart.bind(this))
					.on("dragend", this.onDragEnd.bind(this));
					// if drag over item is enough - .on("dragover", this.onDragOver.bind(this));

			}.bind(this));

			// if drag over item is enough, handle drag over indicator
			//this.$indicator.on("dragover", this.onDragOverIndicator.bind(this));
		},


		onDragStart: function (oEvent) {
			oEvent.originalEvent.dataTransfer.effectAllowed = "move";

			this.$dragItem = jQuery(oEvent.currentTarget);
			this.dragFromIndex = this.$dragItem.index();
			this.dragItemWidth = this.$dragItem.width();
			this.$dragItem.addClass("sapUiDnDDragging");
		},

		onDragOver: function (oEvent) {
			oEvent.preventDefault();
			oEvent.originalEvent.dataTransfer.dropEffect = "move";



			// prevent infinite move of position, caused by rearanging
			if (this.shouldFreeze(oEvent.pageX, oEvent.pageY)) {
				return;
			}

			// propose a drop position
			var mDropPosition = this.calculateDropPosition(oEvent);

			if (!mDropPosition) {
				// drop position is the indicator
				return;
			}

			// no drag/drop on the same target
			if (mDropPosition.target === this.$dragItem[0]) {
				return;
			}

			// after some timeout - show the drop target
			if (this.timeoutOnSamePosition(mDropPosition)) {
				this.hideDraggedItem();
				this.showIndicator(mDropPosition);

				// prevent infinite move of position, caused by rearanging
				this.freezeCurrentPosition(oEvent.pageX, oEvent.pageY);
			}
		},

		onDragEnd: function () {
			this.$dragItem.removeClass("sapUiDnDDragging");

			if (this.$indicator.parents(".sapFGridContainer").length) {
				this.$dragItem.insertAfter(this.$indicator);
				this.$indicator.detach();
			}
		},


		hideDraggedItem: function () {
			this.$dragItem.detach();
		},

		showIndicator: function (mDropPosition) {
			// indicator should be the same size as dragged item
			this.$indicator.css({
				"grid-column-start": this.$dragItem.css("grid-column-start"),
				"grid-row-start": this.$dragItem.css("grid-row-start")
			});

			if (mDropPosition.position == "before") {
				this.$indicator.insertBefore(mDropPosition.target);
			} else {
				this.$indicator.insertAfter(mDropPosition.target);
			}

			// when drop indicator is shown, it is the new "drag from"
			this.dragFromIndex = this.$indicator.index();
		},

		timeoutOnSamePosition: function (mDropPosition) {
			if (!this.lastDropPosition
				|| mDropPosition.target != this.lastDropPosition.target
				|| mDropPosition.position != this.lastDropPosition.position) {

				this.dropPositionHoldStart = Date.now();
				this.lastDropPosition = mDropPosition;
				return false;
			}

			// if the drop position is hold for 500ms
			return Date.now() - this.dropPositionHoldStart > 500;
		},

		shouldFreeze: function (pageX, pageY) {
			// prevent infinite move of position, caused by rearanging
			var iTolerance = 40;

			return this.freezePosition
				&& Math.abs(this.freezePosition.pageX - pageX) < iTolerance
				&& Math.abs(this.freezePosition.pageY - pageY) < iTolerance;
		},

		freezeCurrentPosition: function (pageX, pageY) {
			this.freezePosition = {
				pageX: pageX,
				pageY: pageY
			};
		},


		calculateDropPosition: function (oDragEvent) {

			// if event is over items - this is enough
			// var $target = oDragEvent.currentTarget;

			// if event is over grid - calculate from point / experimenting
			var $target = this.findItemFromPoint(oDragEvent.pageX, oDragEvent.pageY),
				sBeforeOrAfter;

			if (!$target) {
				$target = this.findClosestItem(oDragEvent.pageX, oDragEvent.pageY);
				sBeforeOrAfter = "after"; // todo if closest item is on top, shouldn't be always after
			}

			if (!$target) {
				// fallback to last item in the grid
				$target = jQuery(oDragEvent.currentTarget).children().last();
				sBeforeOrAfter = "after";
			}

			if ($target.hasClass("dndIndicatorBox")) {
				// the indicator is the target
				return null;
			}


			if (!sBeforeOrAfter) {
				sBeforeOrAfter = this.calculateDropBeforeOrAfter($target, oDragEvent);
			}


			return {
				target:  $target[0],
				position: sBeforeOrAfter
			};
		},

		calculateDropBeforeOrAfter: function ($target, oDragEvent) {
			// figure out should it drop before or after the target

			// if small item is over big item - calculate relative position
			if ((this.dragItemWidth * 1.5) < $target.width()) {
				/* mostly copied from DragAndDrop.js */
				var mClientRect = $target[0].getBoundingClientRect(),
					iPageXOffset = window.pageXOffset,
					mDropRect = {
						left: mClientRect.left + iPageXOffset,
						width: mClientRect.width
					},
					iCursorX = oDragEvent.pageX - mDropRect.left;

				return iCursorX < mDropRect.width * 0.5 ? "before" : "after";
			}

			// for same size items the order matters
			if (this.dragFromIndex > $target.index()) {
				return "before";
			}

			// fallback to after
			return "after";
		},


		// experimenting
		findItemFromPoint: function (iPageX, iPageY) {
			var oOverElement = document.elementFromPoint(iPageX, iPageY),
				$closestItem = jQuery(oOverElement).closest(".sapFGridContainerItemWrapper, .dndIndicatorBox");

			if ($closestItem.hasClass("dndIndicatorBox")) {
				// drag over the indicator
				return $closestItem;
			}

			if ($closestItem.hasClass("sapFGridContainerItemWrapper")) {
				return $closestItem;
			}

			return null;
		},

		findClosestItem: function (iPageX, iPageY, bSecondTry) {
			// todo redo this method

			// try around
			var iStep = 80, // px
				$found,
				iTries = 0,
				iX = iPageX - iStep;


			while (!$found && iX > 0 && iTries < 4) { // try left
				$found = this.findItemFromPoint(iX, iPageY);
				iX -= iStep;
				iTries++;
			}

			if (!$found && iPageY - 20 > 0) { // try up, only in close proximity (less than a gap)
				$found = this.findItemFromPoint(iPageX, iPageY - 20);
			}

			return $found;
		}
	});
});