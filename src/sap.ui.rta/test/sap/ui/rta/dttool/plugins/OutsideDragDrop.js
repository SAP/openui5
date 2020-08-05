sap.ui.define([
	"sap/ui/rta/plugin/DragDrop",
	"sap/ui/rta/dttool/plugins/OutsideElementMover",
	"sap/ui/dt/Util",
	"sap/ui/dt/plugin/ControlDragDrop"
],
function(
	DragDrop,
	OutsideElementMover,
	DtUtil,
	ControlDragDrop
) {
	"use strict";

	var OutsideDragDrop = DragDrop.extend("sap.ui.rta.dttool.plugins.OutsideDragDrop", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				commandFactory : {
					type : "object",
					multiple : false
				}
			},
			associations: {},
			events : {
				dragStarted : {},

				elementModified : {
					command : {
						type : "sap.ui.rta.command.BaseCommand"
					}
				}
			}
		}
	});

	OutsideDragDrop.prototype.init = function() {
		DragDrop.prototype.init.apply(this, arguments);
		this.setElementMover(new OutsideElementMover({commandFactory: this.getCommandFactory()}));
	};

	OutsideDragDrop.prototype.onDragStart = function() {
		DragDrop.prototype.onDragStart.apply(this, arguments);
	};

	OutsideDragDrop.prototype.onDragEnd = function(oOverlay) {
		if (!this.getElementMover().isMovingFromOutside()) {
			DragDrop.prototype.onDragEnd.apply(this, arguments);
		} else {
			//Dragged from outside, add XML instead of move
			this.getElementMover().buildAddXMLCommand()
			.then(function(oCommand) {
				oOverlay.getElement().destroy();
				this.fireElementModified({
					command : oCommand
				});

				oOverlay.$().removeClass("sapUiRtaOverlayPlaceholder");
				oOverlay.setSelected(true);
				oOverlay.focus();

				ControlDragDrop.prototype.onDragEnd.apply(this, arguments);
			}.bind(this))
			.catch(function(vError) {
				throw DtUtil.propagateError(
					vError,
					"OutsideDragDrop#onDragEnd",
					"Error accured during onDragEnd execution",
					"sap.ui.rta.plugin");
			});

			this.getElementMover().resetFromOutside();
		}
	};

	return OutsideDragDrop;
});
