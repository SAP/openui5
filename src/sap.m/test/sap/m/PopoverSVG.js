sap.ui.define([
	"sap/m/Popover",
	"sap/m/Button",
    "sap/m/Text",
	"sap/m/library",
    "sap/ui/thirdparty/jquery"
], function (
	Popover,
	Button,
    Text,
	mLibrary,
    jQuery
) {
	"use strict";
    var oPopover = new Popover("pop1", {
        placement: mLibrary.PlacementType.PreferredBottomOrFlip,
        title: "Currect Selection",
        showHeader: true,
        beforeOpen: function (oEvent) {
            jQuery.sap.log.info("before popover opens!!!");
        },
        afterOpen: function (oEvent) {
            jQuery.sap.log.info("popover is opened finally!!!");
        },
        beforeClose: function (oEvent) {
            jQuery.sap.log.info("before popover closes!!!");
        },
        afterClose: function (oEvent) {
            jQuery.sap.log.info("popover is closed properly!!!");
        },
        contentWidth: "300px",
        content: [
            new Text({ text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquaasdsaddasdsadasdasdasdasdasdasdasdas." }),
            new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" }),                new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" }),                new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" }),                new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" }),                new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" }),                new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" }),                new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" }),                new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" }),                new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" }),                new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" }),                new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" }),                new Button({ text: "Action 1" }),
            new Button({ text: "Action 2" })

        ]
    });

    function openPopover(target) {
        oPopover.openBy(target);
    }

    var btn = document.getElementById("openPopover-btn");

    btn.addEventListener("click", function (evt) {
        openPopover(btn);
    });
    var rect1 = document.getElementById("rect1");
    rect1.addEventListener('click', function (evt) {
        openPopover(rect1);
    });
    var flipTop = document.getElementById("flipTop");
    flipTop.addEventListener('click', function (evt) {
        oPopover.setPlacement('PreferredTopOrFlip');
        openPopover(rect1);
    });
    var flipRight = document.getElementById("flipRight");
    flipRight.addEventListener('click', function (evt) {
        oPopover.setPlacement('PreferredRightOrFlip');
        openPopover(rect1);
    });
    var flipBottom = document.getElementById("flipBottom");
    flipBottom.addEventListener('click', function (evt) {
        oPopover.setPlacement('PreferredBottomOrFlip');
        openPopover(rect1);
    });
    var flipLeft = document.getElementById("flipLeft");
    flipLeft.addEventListener('click', function (evt) {
        oPopover.setPlacement('PreferredLeftOrFlip');
        openPopover(rect1);
    });
    var prefTop = document.getElementById("prefTop");
    prefTop.addEventListener('click', function (evt) {
        oPopover.setPlacement('VerticalPreferredTop');
        openPopover(rect1);
    });
    var prefRight = document.getElementById("prefRight");
    prefRight.addEventListener('click', function (evt) {
        oPopover.setPlacement('HorizontalPreferredRight');
        openPopover(rect1);
    });
    var prefBottom = document.getElementById("prefBottom");
    prefBottom.addEventListener('click', function (evt) {
        oPopover.setPlacement('VerticalPreferredBottom');
        openPopover(rect1);
    });
    var prefLeft = document.getElementById("prefLeft");
    prefLeft.addEventListener('click', function (evt) {
        oPopover.setPlacement('HorizontalPreferredLeft');
        openPopover(rect1);
    });


    // var divElement = document.getElementById("divElement");
    var moveButton = document.getElementById("moveButton");
    // divElement.addEventListener('click', function (evt) {
    //     openPopover(divElement);
    // });

    moveButton.addEventListener("click", function(evt) {
        rect1.setAttribute("x", "20");
        rect1.setAttribute("y", "240");
    });
});
