function onImageOsternClicked () {
	var oOsternDiv = document.getElementById("ostern");
	var oImage = oOsternDiv.children[0];
	changeImage(oImage);
}

function changeImage (oImage) {
	var iIndex = Math.floor(Math.random()* 5) + 1;
	oImage.src = "./images/Ostern/ostern" + iIndex + ".png";
}