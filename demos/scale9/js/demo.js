/*
 * Scale9 demo
 * @author: Jovica Aleksic <jovica.aleksic@loopmode.de>
 */

$(function() {
			
	//---------------------------------------------------------------------------
	// basic usage: (expects elements to have a background-image set)
	//---------------------------------------------------------------------------
	$('.box').scale9();
	
	
	//---------------------------------------------------------------------------
	// various advanced feature demos
	//---------------------------------------------------------------------------
	
	
	// green box needs bigger corner radius for the pin in top-tight corner to be visible
	// we use the 'cornerSize' function.
	// alternative usage: $('.box.green').data('scale9').cornerSize(50);
	$('.box.green').scale9('cornerSize', 50);
	
	
	

	// reinitialize a box at runtime. here we make the wrapped box appear green by
	// we can call .scale9() as often as needed without breaking stuff 
	$('.box .box').scale9({src: 'img/dialog-bg-green.png', cornerSize:50});
	
	
	
	
	// demonstrate the plugin's resizability feature using jQueryUI resizable
	// to reapply layout within the elements bounds (whatever the size be), we only need to call the resize() method 
	$('.resizable').resizable({

		resize: function() {
			var grid = $(this).data('scale9'); // in this demo, the grid may not exist because of the "destroy grid"-button, so we check first
			if (grid) {
				grid.resize();
			}
		},
	
		minWidth: 100,
		minHeight: 100
		
	});
		
	// demonstrate that the plugin does not depend on an element's positioning using jQuery UI draggable
	$('.draggable').draggable({
		
		// however, using jQuery UI draggable and resizable at same time will break positioning if you don't omit the draggable classes, see http://stackoverflow.com/questions/5530592/jquery-resizable-draggable-position-absolute
		addClasses: false,
		
		// z-stacking-order: bring dragged box to front
		start: function () {$('.box').css('z-index', 1);$(this).css('z-index', 10);},
		drag: function() {$(this).css('z-index', 10);}
	});
	
	
	// buttons in boxes
	
	$('button.randomize').click(function() {
		$(this).closest('.box')
		.css({
			width: (Math.random() * 500 | 0) + 100, 
			height: (Math.random() * 500 | 0) + 100
		})
		.scale9('resize');
	});
	
	$('button.create').click(function() {
		$(this).closest('.box').scale9();
	});
	
	$('button.destroy').click(function() {
		$(this).closest('.box').scale9('destroy');
	});
	
	$('button.slices').click(function() {
		$(this).closest('.box').find('.scale9-slice').toggleClass('outlines');
	});
});