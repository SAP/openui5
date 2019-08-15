sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/AggregationFilled",
    "sap/ui/core/dnd/DragAndDrop",
    "sap/ui/core/dnd/DragInfo",
    "sap/ui/core/dnd/DropInfo",
    "sap/ui/core/dnd/DragDropInfo",
    "jquery.sap.global",
    "sap/ui/core/Control",
    "sap/ui/core/Element",
    "sap/ui/core/UIArea",
    "sap/ui/core/Core"
], function (Opa5, Press, AggregationFilled, DragAndDrop, DragInfo, DropInfo, DragDropInfo, jQuery, Control, Element, UIArea, Core) {
    "use strict";
    var sViewName = "Main";

    //I borrowed createjQueryDragEventDummy and createNativeDragEventDummy from your own openui5 unit tests
    function createjQueryDragEventDummy(sEventType, oControl, bRemoveId, bRemoveDraggable) {
        var oEvent = jQuery.Event(sEventType);
        var oTarget = oControl.getDomRef();

        oEvent.target = oTarget;
        if (bRemoveId === true) {
            delete oTarget.dataset.sapUi;
            oTarget.removeAttribute("id");
        }
        if (bRemoveDraggable === true) {
            oTarget.draggable = false;
        }
        oEvent.originalEvent = createNativeDragEventDummy(sEventType);

        return oEvent;
    }

    function createNativeDragEventDummy(sEventType) {
        var oEvent;

        if (typeof Event === "function") {
            oEvent = new Event(sEventType, {
                bubbles: true,
                cancelable: true
            });
        } else { // IE
            oEvent = document.createEvent("Event");
            oEvent.initEvent(sEventType, true, true);
        }

        oEvent.dataTransfer = {
            types: [],
            dropEffect: "",
            setDragImage: function () {},
            setData: function () {}
        };

        return oEvent;
    }

    Opa5.createPageObjects({
        somePage: {
            actions: {

                iDragObject: function () {
                    return this.waitFor({
                        controlType: "sap.m.CustomListItem",
                        viewName: sViewName,
                        matchers: function (aCollectionOfObjects) {
                            return aCollectionOfObjects.$().hasClass("dragObjectsYouWant");
                        },
                        success: function (aDraggableObjects) {

                            //Trigger the corresponding oEvents to simulate drag and drop
                            //i.e) dragstart, dragenter and drop
                            var oDraggableElement = aDraggableObjects[0];
                            var oEvent = createjQueryDragEventDummy("dragstart", oDraggableElement);
                            DragAndDrop.preprocessEvent(oEvent);
                            oDraggableElement.$().trigger(oEvent);
                            Opa5.assert.ok(oEvent.dragSession, "Drag session Started");

                            this.waitFor({
                                controlType: "sap.m.CustomListItem",
                                viewName: sViewName,
                                matchers: function (aCollectionOfObjects) {

                                    return aCollectionOfObjects.$().hasClass("droppableZone");
                                },
                                success: function (aCollectionDropZones) {

                                    //Verify if the outbound list is empty
                                    var oDropZone = aCollectionDropZones[0];
                                    Opa5.assert.ok(oDropZone.$().attr("data-state") == "available", "Drop zone is available");


                                    //Simulate the dragging to the outbout and drop
                                    oEvent = createjQueryDragEventDummy("dragenter", oDropZone);
                                    DragAndDrop.preprocessEvent(oEvent);
                                    oDropZone.$().trigger("drop");

                                },
                                errorMessage: "Drop Zone is not available"
                            });



                        },
                        errorMessage: "Inbound locomotive not dragged"
                    });
                }
            }
        }
    });

});