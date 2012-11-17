/*
 * Slideshow demo
 * @author: Jovica Aleksic <jovica.aleksic@loopmode.de>
 */

$(function() {
		
	var bgSlides = new al.ui.Slideshow( $('.fixed-bg .slides') , {
		allowStretching: true,
		fullBg: true,
		centeredV: true,
		/*transition: al.ui.SlideshowTransitions.slideHorizontal,*/
		easing: 'easeInSine',
		interval: 3000,
		duration: 3000,
		autoStart: true
	});
	bgSlides.element.bind('click', $.proxy(bgSlides.next, bgSlides));
	

	var mainSlides = new al.ui.Slideshow( $('.main .slides') , {
		/*transition: al.ui.SlideshowTransitions.slideHorizontal,*/
		easing: 'easeInSine',
		autoHeight: true,
		interval: 1500,
		duration: 1000,
		autoStart: true,
		centeredV: true,
		first: 3
	});
	mainSlides.element.bind('click', $.proxy(mainSlides.next, mainSlides));
	window.m = mainSlides;
	
});