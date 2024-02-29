sap.ui.define([
	"sap/m/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/LightBox",
	"sap/m/LightBoxItem",
	"sap/m/Image",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/VBox",
	"sap/ui/thirdparty/jquery"
], function (
	library,
	App,
	Page,
	LightBox,
	LightBoxItem,
	Image,
	Text,
	Button,
	VBox,
	jQuery
) {
	"use strict";
	var oLightBox = new LightBox('lB1', {
		imageContent: new LightBoxItem({
			imageSrc: 'images/demo/nature/elephant.jpg',
			title: 'I am a title',
			alt: 'picture of elephant'
		})
	});

	var oLightBoxBig = new LightBox('lB2', {
		imageContent: new LightBoxItem({
			imageSrc: 'images/demo/nature/ALotOfElephants.jpg',
			title: 'I am a title',
			subtitle: 'Very big image',
			alt: 'picture of elephant'
		})
	});

	var oLightBoxHorizontal = new LightBox('lB3', {
		imageContent: new LightBoxItem({
			title: 'I am a title',
			subtitle: 'Big horizontal image',
			alt: 'picture of elephant',
			imageSrc: 'images/demo/nature/horses.jpg'
		})
	});

	var oLightBoxVertical = new LightBox('lB4', {
		imageContent: new LightBoxItem({
			title: 'I am a title',
			subtitle: 'Big vertical image',
			alt: 'picture of flat fish',
			imageSrc: 'images/demo/nature/flatFish.jpg'
		})
	});

	var oLightBoxSquare = new LightBox('lB5', {
		imageContent: new LightBoxItem({
			title: 'I am a title',
			subtitle: 'Image smaller than the minimal size of the light box',
			alt: 'picture of elephant',
			imageSrc: 'images/demo/smallImgs/150x150.jpg'
		})
	});

	var oLightBoxVerticalMin = new LightBox('lB6', {
		imageContent: new LightBoxItem({
			title: 'Image with small width but',
			subtitle: 'height bigger than the min size of the light box',
			alt: 'picture of elephant',
			imageSrc: 'images/demo/smallImgs/150x288.jpg'
		})
	});

	var oLightBoxHorizontalMin = new LightBox('lB7', {
		imageContent: new LightBoxItem({
			title: 'Image with small height but',
			subtitle: 'width bigger than the min size of the light box',
			alt: 'picture of elephant',
			imageSrc: 'images/demo/smallImgs/320x150.jpg'
		})
	});

	var oLightBoxInvalidImageTimeout = new LightBox('lB8A', {
		imageContent: new LightBoxItem({
			title: 'Light box with image - time out error',
			subtitle: 'Second line',
			imageSrc: 'images/demo/nature/ALotOfElephants.jpg'
		})
	});

	var oLightBoxInvalidImage = new LightBox('lB8', {
		imageContent: new LightBoxItem({
			title: 'Light box with invalid image',
			subtitle: 'Second line',
			imageSrc: 'invalidSource'
		})
	});

	var oLightBoxInvalidImage2 = new LightBox('lB9', {
		imageContent: new LightBoxItem({
			title: 'Light box with invalid image',
			imageSrc: 'invalidSource'
		})
	});

	var oImage = new Image('image1', {
		src: 'images/demo/nature/elephant.jpg',
		alt: 'click to open the lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBox,
		densityAware: false
	});

	var oImageBigPicture = new Image('image2', {
		src: 'images/demo/nature/ALotOfElephants_small.jpg',
		alt: 'click to open the lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxBig,
		densityAware: false
	});

	var oImageHorizontal = new Image('image3', {
		src: 'images/demo/nature/horses.jpg',
		alt: 'click to open the lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxHorizontal,
		densityAware: false
	});

	var oImageVertical = new Image('image4', {
		src: 'images/demo/nature/flatFish.jpg',
		alt: 'click to open the lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxVertical,
		densityAware: false
	});

	var oImageSquare = new Image('image5', {
		src: 'images/demo/smallImgs/150x150.jpg',
		alt: 'click to open the lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxSquare,
		densityAware: false
	});

	var oImageVerticalMin = new Image('image6', {
		src: 'images/demo/smallImgs/150x288.jpg',
		alt: 'click to open the lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxVerticalMin,
		densityAware: false
	});

	var oImageHorizontalMin = new Image('image7', {
		src: 'images/demo/smallImgs/320x150.jpg',
		alt: 'click to open the lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxHorizontalMin,
		densityAware: false
	});

	var oTextTimeOut = new Text({
		text: "The following image is used for testing the error message when the image is not loaded in 10 seconds. To see it, simulate slow network connection in your browser. For example, in Chrome DevTools set the speed to 'Slow 3G' in the 'Network' tab."
	});

	var oInvalidImageTimeOut = new Image('image8A', {
		src: 'images/demo/nature/elephant.jpg',
		alt: 'opens light box with image that will time out. The lightbox will display an error message for time out',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxInvalidImageTimeout,
		densityAware: false
	});

	var oTextImageError = new Text({
		text: "Next two samples are used for testing the error message, when the image could not be loaded"
	});

	var oInvalidImage = new Image('image8', {
		src: 'images/demo/nature/elephant.jpg',
		alt: 'opens light box with image that has a wrong source set. The lightbox will display an error message',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxInvalidImage,
		densityAware: false
	});

	var oInvalidImage2 = new Image('image9', {
		src: 'images/SAPUI5Icon.png',
		alt: 'opens light box with image that has a wrong source set. The lightbox will display an error message',
		decorative: false,
		width: "88px",
		height: "68px",
		backgroundPosition: "-74px -14px",
		mode: library.ImageMode.Background,
		detailBox: oLightBoxInvalidImage2,
		densityAware: false
	});

	var compactSizeButton = new Button('toggleCompactModeButton', {
		text : 'Toggle Compact mode',
		press : function() {
			jQuery('body').toggleClass('sapUiSizeCompact');
		}
	});

	var oVBox = new VBox({
		items: [
			oTextTimeOut,
			oInvalidImageTimeOut,
			oTextImageError,
			oInvalidImage,
			oInvalidImage2,
			compactSizeButton
		]
	});

	var oPage = new Page("myPage", {
		content: [
			oImage,
			oImageBigPicture,
			oImageHorizontal,
			oImageVertical,
			oImageSquare,
			oImageVerticalMin,
			oImageHorizontalMin,
			oVBox
		]
	});

	var oApp = new App("myApp", {
		initialPage:"myPage"
	});
	oApp.addPage(oPage);

	oApp.placeAt("body");
});


