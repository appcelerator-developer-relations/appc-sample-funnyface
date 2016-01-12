var measurement = require('alloy/measurement');

//this will determine whether we load the 4 funny face
//images or whether one is selected already
var imageSelected = false;

//the 4 image face objects, and their parent view yet to be created
var images;
var image1;
var image2;
var image3;
var image4;

$.win1.open();

function choose(e) {
	$.chooseLabel.hide();

	images = Ti.UI.createView({
		width: Ti.UI.FILL,
		height: 440,
		zIndex: 5
	});

	$.win1.add(images);

	if (imageSelected === false) {
		//transform our 4 image views onto screen so
		//the user can choose one!
		image1 = Ti.UI.createImageView({
			backgroundImage: '/images/clown.png',
			left: -160,
			top: -140,
			width: 160,
			height: 220,
			zIndex: 2
		});
		image1.addEventListener('click', setChosenImage);
		images.add(image1);

		image2 = Ti.UI.createImageView({
			backgroundImage: '/images/policewoman.png',
			right: -160,
			top: -140,
			width: 160,
			height: 220,
			zIndex: 2
		});
		image2.addEventListener('click', setChosenImage);
		images.add(image2);

		image3 = Ti.UI.createImageView({
			backgroundImage: '/images/dracula.png',
			left: -160,
			bottom: -220,
			width: 160,
			height: 220,
			zIndex: 2
		});
		image3.addEventListener('click', setChosenImage);
		images.add(image3);

		image4 = Ti.UI.createImageView({
			backgroundImage: '/images/monk.png',
			right: -160,
			bottom: -220,
			width: 160,
			height: 220,
			zIndex: 2
		});
		image4.addEventListener('click', setChosenImage);
		images.add(image4);

		image1.animate({
			left: 0,
			top: 0,
			duration: 500,
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN
		});

		image2.animate({
			right: 0,
			top: 0,
			duration: 500,
			curve: Ti.UI.ANIMATION_CURVE_EASE_OUT
		});

		image3.animate({
			left: 0,
			bottom: 20,
			duration: 500,
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
		});

		image4.animate({
			right: 0,
			bottom: 20,
			duration: 500,
			curve: Ti.UI.ANIMATION_CURVE_LINEAR
		});
	}

}

//this function sets the chosen image and removes the 4
//funny faces from the screen

function setChosenImage(e) {
	$.imageViewFace.image = e.source.backgroundImage;
	$.imageViewFace.visible = true;
	$.imageViewMe.visible = true;

	//create the first transform
	var transform1 = Ti.UI.create2DMatrix();
	transform1 = transform1.rotate(-180);
	transform1 = transform1.scale(0);

	var animation1 = Ti.UI.createAnimation({
		transform: transform1,
		duration: 500,
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
	});
	image1.animate(animation1);
	animation1.addEventListener('complete', function (e) {
		//remove our image selection from $.win1
		images.remove(image1);
	});

	//create the second transform
	var transform2 = Ti.UI.create2DMatrix();
	transform2 = transform2.scale(0);

	var animation2 = Ti.UI.createAnimation({
		transform: transform2,
		duration: 500,
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
	});
	image2.animate(animation2);
	animation2.addEventListener('complete', function (e) {
		//remove our image selection from $.win1
		images.remove(image2);
	});

	//create the third transform
	var transform3 = Ti.UI.create2DMatrix();
	transform3 = transform3.rotate(180);
	transform3 = transform3.scale(0);

	var animation3 = Ti.UI.createAnimation({
		transform: transform3,
		duration: 1000,
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
	});
	image3.animate(animation3);
	animation3.addEventListener('complete', function (e) {
		//remove our image selection from $.win1
		images.remove(image3);
	});

	//create3DMatrix won’t work on Android
	var transform4;
	if (OS_ANDROID) {
		transform4 = Ti.UI.create2DMatrix();
		transform4 = transform2.scale(0);
	} else {
		transform4 = Ti.UI.create3DMatrix();
		transform4 = transform4.rotate(200, 0, 1, 1);
		transform4 = transform4.scale(2);
		transform4 = transform4.translate(20, 50, 170);
		//the m34 property controls the perspective of the 3D view
		transform4.m34 = 1.0 / -3000;
		//m34 is the position at [3,4]
		//in the matrix
	}

	var animation4 = Ti.UI.createAnimation({
		transform: transform4,
		duration: 1000,
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
	});
	image4.animate(animation4);
	animation4.addEventListener('complete', function (e) {
		//remove our image selection from $.win1
		images.remove(image4);
		$.win1.remove(images);

	});

	//change the status of the imageSelected variable
	imageSelected = true;
}

function onFaceTouchstart(e) {
  e = OS_ANDROID ? measurement.pointPXToDP(e) : e;
	$.imageViewMe.ox = e.x - $.imageViewMe.center.x;
	$.imageViewMe.oy = e.y - $.imageViewMe.center.y;
}

function onFaceTouchmove(e) {
  e = OS_ANDROID ? measurement.pointPXToDP(e) : e;
	$.imageViewMe.center = {
		x: (e.x - $.imageViewMe.ox),
		y: (e.y - $.imageViewMe.oy)
	};
}

function send(e) {
	//hide the footer
	$.footer.visible = false;

	//do a slight delay before capturing the image
	//so we are certain the footer is hidden!
	setTimeout(function (e) {
		//get the merged blob -- note on android you
		//might want to use toBlob() instead of toImage()
		var mergedImage = $.win1.toImage();

		var writeFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'funnyface.jpg');
		writeFile.write(mergedImage);

		//now email our merged image file!
		var emailDialog = Ti.UI.createEmailDialog();
		emailDialog.setSubject("Check out funny face!");
		emailDialog.addAttachment(writeFile);

		emailDialog.addEventListener('complete', function (e) {
			//reset variables so we can do another funny face
			$.footer.visible = true;
			$.imageViewFace.image = null;
			$.imageViewFace.hide();
			$.imageViewMe.hide();
			$.chooseLabel.show();
			imageSelected = false;
		});

		emailDialog.open();

	}, 250);
}

function onSliderChange(e) {
	//create the scaling transform
	var transform = Ti.UI.create2DMatrix();
	transform = transform.scale($.zoomSlider.value);
	var animation = Ti.UI.createAnimation({
		transform: transform,
		duration: 100,
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
	});
	$.imageViewMe.animate(animation);
}
