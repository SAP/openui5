sap.ui.define([
	"sap/m/App",
	"sap/m/Image",
	"sap/m/library",
	"sap/m/LightBox",
	"sap/m/LightBoxItem",
	"sap/m/Page",
	"sap/ui/core/Icon"
], function(App, MImage, mobileLibrary, LightBox, LightBoxItem, Page, Icon) {
	"use strict";

	// shortcut for sap.m.ImageMode
	var ImageMode = mobileLibrary.ImageMode;

	var oLightBox = new LightBox('lB1', {
		imageContent: new LightBoxItem({
			imageSrc: '../images/demo/nature/elephant.jpg',
			title: 'I am a title',
			subtitle: 'Sample image',
			alt: 'picture of elephant'
		})
	});

	var oLightBoxBig = new LightBox('lB2', {
		imageContent: new LightBoxItem({
			imageSrc: '../images/demo/nature/aLotOfElephants.jpg',
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
			imageSrc: '../images/demo/nature/horses.jpg'
		})
	});

	var oLightBoxVertical = new LightBox('lB4', {
		imageContent: new LightBoxItem({
			title: 'I am a title',
			subtitle: 'Big vertical image',
			alt: 'picture of flat fish',
			imageSrc: '../images/demo/nature/flatFish.jpg'
		})
	});

	var oLightBoxSquare = new LightBox('lB5', {
		imageContent: new LightBoxItem({
			title: 'I am a title',
			subtitle: 'Image smaller than the minimal size of the light box',
			alt: 'picture of elephant',
			imageSrc: '../images/demo/smallImgs/150x150.jpg'
		})
	});

	var oLightBoxVerticalMin = new LightBox('lB6', {
		imageContent: new LightBoxItem({
			title: 'Image with small width but',
			subtitle: 'height bigger than the min size of the light box',
			alt: 'picture of elephant',
			imageSrc: '../images/demo/smallImgs/150x288.jpg'
		})
	});

	var oLightBoxHorizontalMin = new LightBox('lB7', {
		imageContent: new LightBoxItem({
			title: 'Image with small height but',
			subtitle: 'width bigger than the min size of the light box',
			alt: 'picture of elephant',
			imageSrc: '../images/demo/smallImgs/320x150.jpg'
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
			subtitle: 'Second line',
			imageSrc: 'invalidSource'
		})
	});

	var oImage = new MImage('image1', {
		src: '../images/demo/nature/elephant.jpg',
		alt: 'lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBox,
		densityAware: false
	});

	var oImageBigPicture = new MImage('image2', {
		src: '../images/demo/nature/ALotOfElephants_small.jpg',
		alt: 'lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxBig,
		densityAware: false
	});

	var oImageHorizontal = new MImage('image3', {
		src: '../images/demo/nature/horses.jpg',
		alt: 'lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxHorizontal,
		densityAware: false
	});

	var oImageVertical = new MImage('image4', {
		src: '../images/demo/nature/flatFish.jpg',
		alt: 'lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxVertical,
		densityAware: false
	});

	var oImageSquare = new MImage('image5', {
		src: '../images/demo/smallImgs/150x150.jpg',
		alt: 'lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxSquare,
		densityAware: false
	});

	var oImageVerticalMin = new MImage('image6', {
		src: '../images/demo/smallImgs/150x288.jpg',
		alt: 'lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxVerticalMin,
		densityAware: false
	});

	var oImageHorizontalMin = new MImage('image7', {
		src: '../images/demo/smallImgs/320x150.jpg',
		alt: 'lightbox',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxHorizontalMin,
		densityAware: false
	});

	var oInvalidImage = new MImage('image8', {
		src: '../images/demo/nature/elephant.jpg',
		alt: 'opens light box with image that has a wrong source set. The lightbox will display an error message',
		decorative: false,
		width: '100px',
		detailBox: oLightBoxInvalidImage,
		densityAware: false
	});

	var oInvalidImage2 = new MImage('image9', {
		src: '../images/SAPUI5Icon.png',
		alt: 'opens light box with image that has a wrong source set. The lightbox will display an error message',
		decorative: false,
		width: "88px",
		height: "68px",
		backgroundPosition: "-74px -14px",
		mode: ImageMode.Background,
		detailBox: oLightBoxInvalidImage2,
		densityAware: false
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
			oInvalidImage,
			oInvalidImage2
		]
	});

	var oApp = new App("myApp", {
		initialPage:"myPage"
	});
	oApp.addPage(oPage);

	oApp.placeAt("body");
});
