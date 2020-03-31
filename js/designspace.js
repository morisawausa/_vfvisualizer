let gridToggle = true;
let dragging = false;

$(document).ready(function() {
	

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
			$('#alt-selector').text(text);
		});
	}


  /* -----------
	POPULATE VISUALIZER GRID
	------------ */
	let axes = {
		'wght': { 
			'min': 100,
			'max': 1000,
		},
		'wdth' : {
			'min': 100,
			'max': 1000,
		}
	}
	let marginW = 100;
	let marginH = 100;
	let gridWidth = $('#grid').outerWidth() - marginW;
	let gridHeight = $('#grid').outerHeight() - marginH;

	function calcRange(nameX, nameY){
		// calculates range of coordinates 
		let coords = {
			"x":{
				"min": 0,
				"max": 0,
			},
			"y":{
				"min": 0,
				"max": 0,
			}
		}
		coords['x']['min'] = axes[nameX]['min'];
		coords['x']['max'] = axes[nameX]['max'];

		coords['y']['min'] = axes[nameY]['min'];
		coords['y']['max'] = axes[nameY]['max'];

		coords['x']['range'] = axes[nameX]['max'] - axes[nameX]['min'];
		coords['y']['range'] = axes[nameY]['max'] - axes[nameY]['min'];
		return coords;
	}

	function populateVisualizer(axisX, stepsX, axisY, stepsY){
		let styles = [];
		let dimensions = calcRange(axisX, axisY);
		// setup font-variation settings for each increment
		// and build HTML string for grid

		let html = '<div class="rows">';

		stepsY.forEach(function(unitY, i){      
		// loop across vertical axis  
			let h = 0; //height of row
			let nextY = 0; // y-axis gridunit

			if( i == stepsY.length-1 ){
				h = marginH + 'px';
				// last row, constant height
				html += '</div>'
			}else{
				nextY = unitY - stepsY[i+1];
				h = 100*( nextY / dimensions['y']['range'] ) + '%';
			}

			html += '<div class="row" style="height:'+ h +'">'

			stepsX.forEach(function(unitX, j){
			  // loop across horizontal axis

			  let w = 0 // width of column;
			  let nextX = 0; // x-axis gridunit

			  let style = ""; // vf css settings
			  style += "'" + axisY + "' " + unitY + ", '" + axisX + "' " + unitX;
			  
			  if( j == 0 ) {
			  	html += '<div class="items">'
			  }
			  if( j == stepsX.length-1 ){
			  	// last grid
			  	w = marginW + "px";
			  	html += '</div>';
			  }else{
			  	nextX = stepsX[j+1] - unitX;
			  	w = 100*( nextX / dimensions['x']['range'] ) + "%"; 		  	
			  }

			  // define grid item
			  html += '<div class="item" data-coordX = "' + unitX + '" data-coordY = "' + unitY + '" data-width= "' + nextX + '" data-height= "' + nextY + '" style="width: ' + w + '; font-variation-settings: ' + style + '" data-glyph = "default" >' + text + '</div>';		 
			});

			html += '</div>' // close row


		});

		$('#grid').html(html);
		viewInfo(dimensions);
	}


  /* -----------
	GRID SEGMENTATION
	------------ */
	let gridLock = { 'x': false, 'y': false};
	let coordX = 0;
	let coordY = 0;

	function viewInfo(dimensions){
		$('#visualizer').on('mousemove', function(e){

			let $target = $(e.target);
			let relX = (e.pageX - $('#grid').offset().left ) / gridWidth;
			let relY = (e.pageY - $('#grid').offset().top ) / gridHeight;

			let gridRange = dimensions;
			coordX = Math.round(gridRange['x']['range'] * relX) + gridRange['x']['min']; 
			coordY = Math.round(gridRange['y']['range'] * (1 - relY) ) + gridRange['y']['min']; 
			
			// restrict coords to handle edges

			if( coordX < gridRange['x']['min']){
				coordX = gridRange['x']['min'];
				gridLock['x'] = true; // lock('x', $('#grid').offset().left );
			}else if ( coordX > gridRange['x']['max'] ){
				coordX = gridRange['x']['max'];
				gridLock['x'] = true; // lock('x', $('#grid').offset().right );
			}else{
				gridLock['x'] = false;
			}

			if( coordY < gridRange['y']['min']){
				coordY = gridRange['y']['min'];
				gridLock['y'] = true; // lock('y', $('#grid').offset().bottom );
			}else if ( coordY > gridRange['y']['max'] ){
				coordY = gridRange['y']['max'];
				gridLock['y'] = true; // lock('y', $('#grid').offset().top );
			}else{
				gridLock['y'] = false;
			}

			// hide if cursor moves to sidebar
			if ( e.pageX > $(this).outerWidth() ){
				gridToggle = false;
			}else{
				gridToggle = true;
			}



			let altState = $target.attr('data-glyph');
			// update sample letter
			$('#editor').css('font-variation-settings', "'wght' " + coordY + ", 'wdth' " + coordX);
			$('#editor').attr('data-glyph', altState);

			// move grid lines
			if( gridToggle ){

				$('#coords').show();

				if( $('#x-break').is(':checked') ){
					$('#vertical-line').show();
					if (!gridLock['x']){
						$('#vertical-line').css('transform', 'translateX(' + e.pageX + 'px)');
					}	
				}else if( $('#y-break').is(':checked') ){
					$('#horizontal-line').show();
					if (!gridLock['y']){
						$('#horizontal-line').css('transform', 'translateY(' + e.pageY + 'px)');
					}
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
	}
	





		


  /* -----------
	SELECT SUBSTITUTION AREA
	------------ */	
	let lasso = false;
	let ctrlOn = false;

	if( $('#selection').is(':checked') ){
		lasso = true;
		$('.whole').css('pointer-events', 'none');
	 	
	 	let rectangleCoords  = [];

		$('#grid').on('click', '.item', function(e){
			console.log('lasso');

			// add rectangles for selection
			

			if (e.metaKey){

				$('.selected').each(function(i){
					let rect = {};

					rect['x'] = parseInt( $(this).attr('data-coordX') );
					rect['y'] = parseInt( $(this).attr('data-coordY') );
					rect['width'] = parseInt( $(this).attr('data-width') );
					rect['height'] = parseInt( $(this).attr('data-height') );
					
					rectangleCoords.push(rect);
										
				});


				// console.log(sets);

				let mergedRows = [];
				mergedRows.push(rectangleCoords[0]);
				let counter = 0;
				
				let newRect = {}
				let sumWidth = rectangleCoords[0]['width'];

				// merge rectangles	in X
				for( var i = 0; i < rectangleCoords.length-1; i++){
					// for every row of items
					thisRect = rectangleCoords[i]; 
					nextRect = rectangleCoords[i+1];

					if( (thisRect['y'] == nextRect['y']) && (thisRect['height'] == nextRect['height']) ){
						// if next rectangle is at the same y coord
						sumWidth = sumWidth + nextRect['width']; // merge widths
						mergedRows[counter]['width'] = sumWidth;
					}else{
						counter++; // don't merge; 
						sumWidth = rectangleCoords[i]['width']; // reset sumWidth 
						mergedRows[counter] = nextRect; // store new rect info
					}
				};

				// merge rectangles	in Y
				let merged = [];
				merged.push(mergedRows[0]);
				let sumHeight = mergedRows[0]['height'];
				let counterY = 0;

				for( var j = 0; j<mergedRows.length - 1; j++){
					thisRow = mergedRows[j];
					nextRow = mergedRows[j+1];

					if( (thisRow['x'] == nextRow['x']) && (thisRow['width'] == nextRow['width']) ){
						// if next rectangle is at the same x coord
						sumHeight = sumHeight + nextRect['height']; // merge heights
						merged[counterY]['height'] = sumHeight;
					}else{
						counterY++;
						sumHeight = mergedRows[j]['height']; // reset sumWidth 
						merged[counterY] = nextRow; // store new rect info
					}
				};
				
				

				console.log(mergedRows);
				console.log(merged);


				// pullUpSubs($(e.target), e.pageX, e.pageY);

				$('#alt-selector').css({
					'transform': 'translate(' + e.pageX +'px, ' + e.pageY +'px)'
				});
				$('#alt-selector').attr('data-status','visible');

				$('.alt').click(function(){
					let glyphStyle = $(this).attr('id');

					$('.selected').attr('data-glyph', glyphStyle);
					$('.selected').removeClass('selected');
					$('#alt-selector').attr('data-status','hidden');
				});
				
			}else{
				$(this).toggleClass('selected');

			}
			
		});
	}
	
	leafSegmentation();

	function leafSegmentation(){
		$('.leaf').on('click', function(e){
			if( !lasso ) {
				console.log('leaf');
				gridToggle = false;

				let $target = $(e.target);
				let $parent = $target.parent();

				let mouseX = e.pageX - $target.offset().left;
				let mouseY = e.pageY - $target.offset().top;
				let segmentWidth = $target.width();
				let segmentHeight = $target.height();


				let glyphState = $(this).attr('data-glyph');
				// divide up segments at mouse cursor

				if( dragging ){
					e.stopPropagation();
					return false;						
				}else if( $('#x-break').is(':checked') ){
					// add horizontal breakpoint
					let breakX = Math.round(100*(mouseX/segmentWidth));
					addBreakpoint('x', $target, breakX, glyphState);

				}else if( $('#y-break').is(':checked') ){
					// add vertical breakpoint
					let breakY = Math.round(100*(mouseY/segmentHeight));
					addBreakpoint('y', $target, breakY, glyphState);

				}else if( $('#resize').is(':checked')){
					// update applied areas upon leaf resizing

					// let $resizeLeaf = $('.resizable', $(this));
					// let resizeGlyphState = $resizeLeaf.attr('data-glyph');
					// let updateArea = $resizeLeaf[0].getBoundingClientRect();
					// updateInstances(updateArea, resizeGlyphState);

					// let $nextLeaf = $('.leaf:nth-child(2)', $(this));
					// let nextGlyphState = $nextLeaf.attr('data-glyph');
					// let nextUpdateArea = $nextLeaf[0].getBoundingClientRect();
					// updateInstances(nextUpdateArea, nextGlyphState);


				}else if( $('#clear').is(':checked') ){
					// remove breakpoints

					if($('.segment').length > 1){

						// merge leaves
						$parent.empty(); 
						
						// return alts to default
						let clearArea = $parent[0].getBoundingClientRect();
						updateInstances(clearArea, 'default');

						// setup as merged as leaf
						$parent.addClass('leaf');
					}
				}else{
					// select substitutions
					if( $('#alt-selector').attr('data-status') == 'visible' ){
						// remove modal if click outside of options
						hideSelector();
					}else{
						// pull up alternate substitution menu
						pullUpSubs( $target, e.pageX, e.pageY);	
					}
				}

				deactivateTool();
			}
		});
	
			
	}

	function addBreakpoint(axis, element, position, glyph){
		element.removeClass('leaf');
		if (axis == 'x'){
			element.append('<div class="segment leaf resizable" style="flex: none; width:' + position + '%" data-glyph="' + glyph +'"><div class="dragbar x"></div></div><div class="segment leaf" data-glyph="' + glyph +'"></div>');
			breakName = controls['x-axis'];
			breakTo = coordX;
		}else{
			element.addClass('stack');
			element.append( '<div class="segment leaf resizable" style="flex: none; height:' + position + '%" data-glyph="' + glyph +'"><div class="dragbar y"></div></div><div class="segment leaf" data-glyph="' + glyph +'"></div>');
			breakTo = coordY;
		}

		// let breakpointHtml =
		// `<div class="condition axisName">
		// 	<div class="axisName">` + breakName +`</div>
		// 	<div class="from">` + 0 +`</div>
		// 	<div class="to">` + coordX +`</div>
		// </div>`;

		// console.log(breakpointHtml)
		// $('#output').append(breakpointHtml);

	}
	

	// resize if dragging
	// $(".leaf").on('mousedown', '.dragbar', function(e) {
	//     console.log('dragging');
	// 	dragging = true;
	// 	let thisLeaf = $(this).parent();
	// 	let parentWidth = thisLeaf.parent().width();
	// 	$(document).mousemove(function(e){
	// 		thisLeaf.css('width', 100*(e.pageX/parentWidth) + '%');
	// 	}).mouseup(function(e){
	// 		thisLeaf.css('width', 100*(e.pageX/parentWidth) + '%');
	// 		$(document).unbind('mousemove');
	// 		setTimeOut(function(){
	// 			dragging = false;
	// 		}, 100);			
	// 	});

	// });




	function deactivateTool( ){
		// deactivates breakpoint tool
		$('#x-break, #y-break').prop('checked', false);

		$('#vertical-line, #horizontal-line').hide();
	}

	function hideSelector(){
		$('#alt-selector').attr('data-status','hidden');
		$('.leaf.active').removeClass('active');
	}

	// toggle grid view on when breakpoint tool is active
	$('input[type=radio][name=segmentation]').on('change', function() {
	   
	    if ( $(this).attr('id') !== 'selection' ){
	    	lasso = false;
	    	$('.whole').css('pointer-events', 'auto');
	    }else{
	    	lasso = true;
	    	$('.whole').css('pointer-events', 'none');
	    }


	    if ($(this).attr('id') == 'x-break'){
	        gridToggle = true;
	    }
	    else if ($(this).attr('id') == 'y-break'){
	        gridToggle = true;
	    }
	    else if ($(this).attr('id') == 'resize'){
			$('.leaf').addClass('no-hover');
			// $('.resizable').addClass('enabled');
			
		}else if ($(this).attr('id') == 'clearall'){
			$('.leaf, .resizable').remove();
			$('.whole').addClass('leaf');
			// $('#x-break').prop('checked', true);
			$('.item').attr('data-glyph', 'default');

		}
	});

	function pullUpSubs(el, x, y){
		// pull up substitution options at cursor position
		el.addClass('active');
		// flag active segment

		// position and show sub-selector
		$('#alt-selector').css({
			'transform': 'translate(' + x +'px, ' + y +'px)'
		});
		$('#alt-selector').attr('data-status','visible');


		// select alternate glyph
		$('.alt').click(function(){
			let glyphStyle = $(this).attr('id');

			let leafArea = $('.leaf.active')[0].getBoundingClientRect();
			updateInstances(leafArea, glyphStyle);

		});
	}


  /* -----------
	SELECT SUBSTITUTION GLYPHS
	------------ */



	function updateInstances(activeArea, glyph){
		// updates visualizer items within the specified activeArea (leaf)

		$('.item').each(function(){
			let itemArea = $(this)[0].getBoundingClientRect();
			if( itemArea.left >= activeArea.left && itemArea.left <= activeArea.right && itemArea.top >= activeArea.top && itemArea.top <= activeArea.bottom){
				$(this).attr('data-glyph', glyph);
			}
		});

		// deactivate and hide elements
		$('.leaf.active').attr('data-glyph', glyph);
		$('.leaf.active').removeClass('active');
		$('#alt-selector').attr('data-status','hidden');
	}
	

  /* -----------
	CALCULATE INCREMENTS TO VISUALIZE
	------------ */
	let inc = 1;

	let formulas = {
		'linear': linear,
		'lucas': lucas,
		'impallari': impallari
	}

	function linear(min, max, steps){
		// linearly spread out increments
		let linearSteps = [];
		let linInc = 0;
		let step = (max-min)/(steps-1);
		for ( let i=0; i<steps; i++){
			linInc = min + i*step;
			linearSteps.push(Math.round(linInc));
		}
		return linearSteps;
	}

	function lucas(min, max, steps){
		// From Luc(as) de Groot’s Interpolation theory 
		// https://www.lucasfonts.com/learn/interpolation-theory

		let lucasSteps = [];
		let lucasInc = 0;
		for ( let i=0; i<steps; i++){
			if (min == 0){
				min = 1;
			}
			let radicand = Math.pow(min, (steps-1-i)) *  Math.pow(max, i);
			lucasInc = Math.pow( radicand, 1/(steps-1) );
			lucasSteps.push(Math.round(lucasInc));
		}
		return lucasSteps;
	}


	function impallari(min, max, steps){
		// takes weighted average of the lucas and linear increments
		// https://www.diacritics.club/family-steps
		// https://web.archive.org/web/20170721200038/http://www.impallari.com/familysteps/index.php

		let lucasResults = lucas(min, max, steps);
		let linearResults = linear(min, max, steps);
		let impInc = 0;
		let impallariSteps = [];
		for ( let i=0; i<steps; i++){
			let t = i/(steps-1);
			impInc = (1-t) * lucasResults[i] + t * linearResults[i]; 
			impallariSteps.push(Math.round(impInc));
		}
		return impallariSteps;
	}

  /* -----------
	SETUP CONTROLS
	------------ */

	let controls = {
		"x-axis": "wdth",
		"x-formula": "linear",
		"x-steps": 6,
		"x-incs": [ ],
		"y-axis": "wght",
		"y-formula": "linear",
		"y-steps": 4,
		"y-incs": [ ]
	};

	// update when any controls are changed
	function setupController(){
		$('.axes select, .axes input').on('change', function() {
			let key = $(this).attr('id');
		   controls[key] = $(this).val();
		   let XorY = key.charAt(0);
		   updateControls(XorY);
		});
	}

	function updateControls(axis){
		// updates x or y axis controls and grid;
		let steps = [];

		// generate steps for this axis
		steps = generateIncrements(axis);

		// update axis-appropriate control panel
		populateIncrements(steps, axis); 
		
		// update grid view
		populateVisualizer(controls['x-axis'], controls['x-incs'], controls['y-axis'], controls['y-incs']);
	}

	function generateIncrements(axis){
		let increments = [];
		if(axis == 'x'){

			let axisNameX = controls['x-axis'];
			let formulaX = controls['x-formula'];
			let stepsX = controls['x-steps'];

			let minX = axes[axisNameX]['min'];
			let maxX = axes[axisNameX]['max'];

			increments = formulas[formulaX](minX, maxX, stepsX); // calculate increments
			controls['x-incs'] = increments; // update controller object

		}else if (axis == 'y'){

			let axisNameY = controls['y-axis'];
			let formulaY = controls['y-formula'];
			let stepsY = controls['y-steps'];

			let minY = axes[axisNameY]['min'];
			let maxY = axes[axisNameY]['max'];

			increments = formulas[formulaY](minY, maxY, stepsY); // calculate increments
			controls['y-incs'] = increments.reverse(); // update controller object
		}
		return increments;
	}

	// populates increment fields based off of increment list
	function populateIncrements(stepList, xy){
		
		let stepsHTML = "";

		stepList.forEach(function(step, i){
			stepsHTML += '<input type="number" id="inc-' + i + '" class="step" value=' + step + '>';
		});

		$('#'+ xy + '-increments').html(stepsHTML);
	}

 


  /* -----------
	WRITE SUBSTITUTION RULES
	------------ */



  /* -----------
	INITIALIZE
	------------ */

	function initialize(){
		getInputGlyph();
		updateControls('x'); 
		updateControls('y');
		setupController();
	}

	initialize();

  });