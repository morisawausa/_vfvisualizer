let selectToggle = false;
let clickCount = 0;
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
			}else if ( coordX > gridRange['x']['max'] ){
				coordX = gridRange['x']['max'];
			}

			if( coordY < gridRange['y']['min']){
				coordY = gridRange['y']['min'];
			}else if ( coordY > gridRange['y']['max'] ){
				coordY = gridRange['y']['max'];
			}


			let altState = $target.attr('data-glyph');
			// update sample letter
			$('#editor').css('font-variation-settings', "'wght' " + coordY + ", 'wdth' " + coordX);
			$('#editor').attr('data-glyph', altState);
			$("#mouseX").val(coordX);
			$("#mouseY").val(coordY);

			// move grid lines
			
		});
	}
	


  /* -----------
	WRITE SUBSTITUTION RULES
	------------ */
	
	function viewOutput(rules){
		let conditions = [];
		rules.forEach(function(rule){
			glyph = rule[0];
			recs = rule[1];
			// [name, min, max]

			recs.forEach(function(r){
				
				let nameY = controls['y-axis'];
				let nameX = controls['x-axis'];
				let maxY = axes[nameY]['max'];
				let maxX = axes[nameX]['max'];

				// substract one for intermediate areas
				// to avoid overlapping rectangles
				if (r['y'] != maxY){
					maxY = r['y']-1; 
				}
				if (r['X'] != maxX){
					maxX = r['x'] + r['width'] - 1;
				}
				
				let set = [
					[ nameY, r['y'] - r['height'], maxY],
					[ nameX, r['x'], maxX]
				];
				
				conditions.push(set);
			});			
		});

		let outputHtml = "";

		conditions.forEach(function(set){
			outputHtml += '<div class="set">'
			set.forEach(function(r){
				outputHtml += `<div class="condition">
					<div class="name">` + r[0] +`</div>
					<div class="min">` + r[1] +`</div>
					<div class="max">` + r[2] +`</div>
				</div>`
			});
			outputHtml += '</div>'
		});

		$('#rules').html(outputHtml);
	}

	let ctrlOn = false;

	

 	function mergeRecs(rectangleCoords){

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
 		return merged;
 	}

 	$("#grid").on('mouseenter', '.item', function(){

 		if(selectToggle){
 			let item = $(this);
	 	   	let timer = setTimeout(function(){
	 	        item.addClass('selected');
	 	    }, 100);
	 	    $(this).on('mouseleave', '.item', function() {
	 	   	    clearTimeout(timer);
	 	     });
	 	}
 	});


	$('#grid').on('click', '.item', function(e){
		// add rectangles for selection

		if ( $('#substitute').is(':checked') ){
			processSelection(e);
		}else{
			// add to selection
			let itemActive = $(this).hasClass('selected');

			if (itemActive && selectToggle){
				//end selection
				selectToggle = false;
			}else if(itemActive && !selectToggle){
				$(this).removeClass('selected');
				$(this).attr('data-glyph', 'default');
			}
			else if (!itemActive && !selectToggle){
				//start selection
				$(this).addClass('selected');
				selectToggle = true;
			}			
		}
	});

	 /* -----------
	SELECT SUBSTITUTION GLYPHS
	------------ */

	function processSelection(e){
		// takes selected grid items
		// activates substitution selection
		// generates rules

		let rectangleCoords = [];

		$('.selected').each(function(i){
			let rect = {};

			rect['x'] = parseInt( $(this).attr('data-coordX') );
			rect['y'] = parseInt( $(this).attr('data-coordY') );
			rect['width'] = parseInt( $(this).attr('data-width') );
			rect['height'] = parseInt( $(this).attr('data-height') );
			
			rectangleCoords.push(rect);
								
		});

		let ruleSet = mergeRecs(rectangleCoords);			

		pullUpAlts(e, ruleSet); // pull up 
	}
 
	function pullUpAlts(e, area){
		let rules = []; // reset rules;

		// position substitution options at cursor
		$('#alt-selector').css({
			'transform': 'translate(' + e.pageX +'px, ' + e.pageY +'px)'
		});
		$('#alt-selector').attr('data-status','visible');

		// setup rules when selecting glyph style
		$('.alt').click(function(){
			let glyphStyle = $(this).attr('id');
			$('.selected').attr('data-glyph', glyphStyle);
			$('#select').prop('checked', true); 
			// $('.selected').removeClass('selected'); 
			$('#alt-selector').attr('data-status','hidden');
			rules.push([glyphStyle, area]);

			viewOutput(rules);
		});
	}

	$(document).on('keydown', function(e){
		if (e.metaKey ){
			console.log('metakey');
			$('#substitute').prop('checked', true);
		}
	}).on('keyup', function(){
		$('#substitute').prop('checked', false);
		$('#select').prop('checked', true);
	});
	

	$('input[type=radio][name=selection]').on('change', function() {
		let button = $(this).attr('id');

	    if ( button == 'select'){
	        selectToggle = true;
	    }else if (button == 'substitute'){
	        selectToggle = false;
		}else if (button == 'clearall'){
			$('.selected').removeClass('selected');
			$('#select').prop('checked', true);
			$('.item').attr('data-glyph', 'default');
			$('#rules').text('');
		}
	});

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