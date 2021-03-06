/*
 * Scale9 demo
 * @author: Jovica Aleksic <jovica.aleksic@loopmode.de>
 */

$(function() {
		
	if (window.location.href.match(/github/)) {
		$('#github-note').show();
	}
	
	$('button').button();
	
	//---------------------------------------------------------------------------
	// basic usage: (expects elements to have a background-image set)
	//---------------------------------------------------------------------------
	$('.box').scale9();
	
	// elements with percentage-based with need to resize on browser resize.
	$('.box.block').scale9('autoResize', true);
	
	//---------------------------------------------------------------------------
	// various advanced feature demos
	//---------------------------------------------------------------------------
	
	
	// green box needs bigger corner radius for the pin in top-tight corner to be visible
	// we use the 'cornerSize' function.
	// alternative usage: $('.box.green').data('scale9').cornerSize(50);
	$('.box.green').scale9('cornerSize', 50);
	
	
	
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
	
	
	// buttons 
	$('button.randomize').click(function() {
		$(this).closest('.box')
		.css({
			width: (Math.random() * 500 | 0) + 100, 
			height: (Math.random() * 500 | 0) + 100
		})
		.scale9('resize');
	});
	
	$('button.create').click(function() {
		$('button.destroy').show();
		$('button.slices').show();
		$(this).hide();
		$('.box').scale9();
		$('.box.green').scale9('cornerSize', 50);
	});
	
	$('button.destroy').click(function() {
		$('.box').scale9('destroy');
		$('button.create').show();
		$('button.slices').hide();
		$(this).hide();
	});
	
	$('button.create').hide();
	
	$('button.slices').click(function() {
		$('body').toggleClass('outlines');
	});
	
	$('button.hide-others').click(function() {
		$('.box').hide();
		$(this).closest('.box').show();
		$(this).hide();
		$(this).closest('.box').css({
			position: 'absolute',
			bottom: 'auto',
			left: 0.5 * ($(window).width() - $(this).closest('.box').width()),
			top: 0.5 * ($(window).height() - $(this).closest('.box').height())
		}).scale9('resize').resizable();
	});
});