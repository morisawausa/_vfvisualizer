let gridToggle = true;

$(document).ready(function() {
	let axes = {
		'y': { 
			'name': 'wght',
			'max': 1000,
			'inc': [1, .5, 0]
		},
		'x' : {
			'name': 'wdth',
			'max': 1000,
			'inc': [0, .25, .5, .75, 1]
		}
	}

	let text = $("#editor").val();

  /* -----------
	GET GLYPH TO VISUALIZE
	------------ */
	function getInputGlyph(){
		// get glyph from input
		$('.alt').text(text);

		$('#editor').on('input', function() {
			text = $("#editor").val();
			$('.item').each(function(){
				$(this).text(text);
			});
			$('#sub-selector').text(text);
		});
	}
	
	getInputGlyph();


  /* -----------
	POPULATE VISUALIZER GRID
	------------ */
	function populateVisualizer(){
		let styles = [];
		// setup font-variation settings for each increment

		axes['y']['inc'].forEach(function(unitY){      
		// loop across vertical axis  
			let row = []
		
			axes['x']['inc'].forEach(function(unitX, i){
			  // loop across horizontal axis
			  let style = "";
			  style += "'wght' " + unitY*axes['y']['max'] + ", 'wdth' " + unitX*axes['x']['max'];
			  row.push(style); 
			});
			styles.push(row);
		  });

		// append to document
		let html = "";
		styles.forEach(function(row){
			html += '<div class="row">'
			row.forEach(function(setting){
				html += '<div class="item" style="font-variation-settings: ' + setting + '">' + text + '</div>';
			});
			html += '</div>'
		});

		$('#visualizer').append(html);
	}

	populateVisualizer();
	


  /* -----------
	GRID SEGMENTATION
	------------ */

	let windowWidth = $('#visualizer').outerWidth();
	let windowHeight = $('#visualizer').outerHeight();

	$('#visualizer').on('mousemove', function(e){
		let $target = $(e.target);
		let relX = e.pageX / windowWidth;
		let relY = e.pageY / windowHeight;
		let coordX = Math.round(axes['x']['max']*relX);
		let coordY = Math.round(axes['y']['max']*relY);
		
		// update sample letter
		$('#editor').css('font-variation-settings', "'wght' " + (axes['y']['max'] - coordY) + ", 'wdth' " + coordX);



		// move grid lines
		if( gridToggle ){
			$('#coords').show();

			if( $('#x-break').is(':checked') ){
				$('#vertical-line').show();
				$('#vertical-line').css('transform', 'translateX(' + e.pageX + 'px)');
			}else if( $('#y-break').is(':checked') ){
				$('#horizontal-line').show();
				$('#horizontal-line').css('transform', 'translateY(' + e.pageY + 'px)');
			}

			// move around coordinate box			
			$('#coords').css({
				'transform': 'translate(' + e.pageX +'px, ' + e.pageY +'px)'
			});
			$("#x-coord").text(coordX);
			$("#y-coord").text(coordY);
		}else{
			$('#vertical-line, #horizontal-line, #coords').hide();
		}
		
	});


  /* -----------
	SELECT SUBSTITUTION AREA
	------------ */

	// $('.segment').on('mouseover', function(){
	// 	$(this).toggleClass('active');
	// });
	$('.leaf').click(function(e){
		gridToggle = false;
		let $target = $(e.target);
		
		let mouseX = e.pageX - $target.offset().left;
		let mouseY = e.pageY - $target.offset().top;
		let segmentWidth = $target.width();
		let segmentHeight = $target.height();


		// divide up segments at mouse cursor

		if( $('#x-break').is(':checked') ){
			// add horizontal breakpoint

			let breakX = Math.round(100*(mouseX/segmentWidth));
			$target.removeClass('leaf');
			$target.append('<div class="segment leaf" style="width:' + breakX + '%"></div><div class="segment leaf" style="width:' + (100-breakX) + '%; left:' + breakX + '%"></div>');
		
		}else if( $('#y-break').is(':checked') ){
			// add vertical breakpoint

			let breakY = Math.round(100*(mouseY/segmentHeight));
			$target.removeClass('leaf');
			$target.append( '<div class="segment leaf" style="height:' + breakY + '%"></div><div class="segment leaf" style="height:' + (100-breakY) + '%; top:' + breakY + '%"></div>');
		
		}else if( $('#clear').is(':checked') ){
			// remove breakpoint

			if($('.segment').length > 1){
				let $parent = $target.parent();

				// merge leaves
				$parent.empty(); 
				
				// return alts to default
				let clearArea = $parent[0].getBoundingClientRect();
				updateInstances(clearArea, 'default');

				// setup as leaf
				$parent.addClass('leaf');
			}
		}else{
			// pull up alternate substitution menu
			pullUpSubs( $target, e.pageX, e.pageY );
		}
		
		deactivateTool();

		// 
		// $(this).addClass('active'); // flag active segment

		// $('#sub-selector').css({
		// 	'transform': 'translate(' + e.pageX +'px, ' + e.pageY +'px)'
		// });
		// $('#sub-selector').addClass('show');

		// // deactivate tool
		// $('#x-break, #y-break').prop('checked', false);

	});

	function deactivateTool( ){
		$('#x-break, #y-break').prop('checked', false);
	}

	$('input[type=radio][name=segmentation]').on('change', function() {
		console.log('change radio');
	    if ($(this).attr('id') == 'x-break') {
	        gridToggle = true;
	    }
	    else if ($(this).attr('id') == 'y-break') {
	        gridToggle = true;
	    }
	});

	function pullUpSubs(el, x, y){
		// pull up substitution options at cursor position

		// $('.active').removeClass('active'); // clear current active flags
		el.addClass('active'); // flag active segment

		// position and show sub-selector
		$('#sub-selector').css({
			'transform': 'translate(' + x +'px, ' + y +'px)'
		});
		$('#sub-selector').addClass('show');
	}

  /* -----------
	SELECT SUBSTITUTION GLYPHS
	------------ */

	$('.alt').click(function(){
		let glyphStyle = $(this).attr('id');

		let leafArea = $('.leaf.active')[0].getBoundingClientRect();
		updateInstances(leafArea, glyphStyle);

		// deactivate and hide elements
		$('.leaf.active').removeClass('active');
		$('#sub-selector').removeClass('show');
	});

	function updateInstances(activeArea, glyph){
		// updates visualizer items within the specified activeArea (leaf)

		$('.item').each(function(){
			let itemArea = $(this)[0].getBoundingClientRect();
			if( itemArea.left >= activeArea.left && itemArea.left <= activeArea.right && itemArea.top >= activeArea.top && itemArea.top <= activeArea.bottom){
				if( glyph == 'default' ){
					// remove stylistic alternates
					$(this).removeClass('feature-active');
				}else{
					// add selected stylistic alternate
					$(this).addClass('feature-active');
					$(this).addClass(glyph);
				}
			}
		});
	}
	

	// function debounce(func, wait, immediate) {
	// 	var timeout;
	// 	return function() {
	// 		var context = this, args = arguments;
	// 		var later = function() {
	// 			timeout = null;
	// 			if (!immediate) func.apply(context, args);
	// 		};
	// 		var callNow = immediate && !timeout;
	// 		clearTimeout(timeout);
	// 		timeout = setTimeout(later, wait);
	// 		if (callNow) func.apply(context, args);
	// 	};
	// };
  });