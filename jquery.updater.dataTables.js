/**
 *  created by shewang..
 *  
 *  instead of the Editor plugin of DataTalbe..
 */
(function($){
	
	var defaultOpts = {
			
	}
	
	var upIdx = -1;   // the index of the column for update.    begin with 0;
	var upCol;  // the thead obj of the column for update.
	var lineHTML = '<HR class="updaterLine" style="border:1 double #987cb9;margin-top:23px;margin-bottom:10px;" width="100%" color=#987cb9 SIZE=0/>';

	var updaterElement = '<div id="updaterDiv" class="alertify" style="display:none;">'
  			+'<div class="alertify-dialog">'
  			+'<div class="updateHead row" style="padding-left:20px;"><div id="updaterTitle" style="float:left;margin:10px 0 0 0px;z-index:2;"><strong style="font-size:1.8em;font-weight: bold;">Updater</strong></div>'
  			+'<div id="updaterCloser" style="float:right;margin: -10px 10px 0 0;z-index:2;">'
  			+'<button class="btn"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div>'
  			+ '<HR style="border:3 double #987cb9;margin-top:15px;" width="100%" color=#987cb9 SIZE=1/></div>'
  			+ '<div class="innerForm row" style="padding-left:10%;padding-right:10%;"></div>'
  			+'<div class="updaterFoot row"  style="padding-left:20px;padding-right:10px;">'+lineHTML
  			+'<button id="updaterSubmit" class="btn btn-primary" style="margin-top:15px;margin-bottom:15px;">Submit</button></div>'
  			+'</div></div>'
  			+'<div id="updaterCover" class="alertify-cover" style="display:none;"></div>';
	
	var fieldTemplate = {
			input:{
				html:'<div class="updaterInputWapper" style="vertical-align:middle;"><span style="float:left;display:block;width:35%;">{label}:</span>'
					+'<span style="float:left;display:block;width:45%;"><input type="text" name="{name}" placeholder="起始时间"></span></div>'
					
			},
			select:{
				html:'<div class="updaterInputWapper" style="vertical-align:middle;"><span style="float:left;display:block;width:35%;">{label}:</span>'
					+'<span style="float:left;display:block;width:45%;"><select name="{name}"></select></span></div>'
			},
			date:{
				html:'<div class="updaterInputWapper" style="vertical-align:middle;"><span style="float:left;display:block;width:35%;">{label}:</span>'
					+'<span style="float:left;display:block;width:45%;"><input type="date" name="{name}" placeholder="起始时间"></span></div>'			
			},
			datetime:{
				html:'<div class="updaterInputWapper" style="vertical-align:middle;"><span style="float:left;display:block;width:35%;">{label}:</span>'
					+'<span style="float:left;display:block;width:45%;"><input type="datetime" name="{name}" placeholder="起始时间"></span></div>'			
			}
	};
	
	
	var defaultAjaxOpts = {
			dataType:"json",
			type:"POST",
			processData:true,
			fail:function(){
				throw 'update request is failed';
			}
	}
	
	
	$.fn.updater = function(options){
		var options = $.extend(defaultOpts, options||{});

		init(this,options);
			
		//bind click event for each row's update column
		$(this).on('click','.updaterItem',function(e){
			var row = options.table.row('.selected');	
			defaultAjaxOpts.row = row;
			fillUpdaterForm(options.fields ,row);		
			//open updater div
			toggleUpdaterElms('open');
			row.deselect();
			e.preventDefault();
		});
			
	}
	
	var init = function(that,options){
		//insert updater divs and hide them at first
		$(document).find('body').append(updaterElement);
		
		var updaterDiv = $('#updaterDiv');
		var updaterCover = $('#updaterCover');
		
		if(isEmpty(options.ajax)){
			throw 'ajax attribute cannot be empty!'
		}
		if(isEmpty(options.ajax.url)){
			throw 'ajax.url attribute cannot be empty!'
		}
		if(isEmpty(options.table)){
			throw 'Table could not be emply.'
		}
			
		var tableElm = $(that);
		if(!hasUpdateCol(tableElm)){
			throw 'Table donot have update class on any column!';
			return;
		}
		
		//insert updater divs and hide them at first
		toggleUpdaterElms('close');
		
		//bind close button
		$(document).on('click','#updaterCloser',function(e){
			toggleUpdaterElms('close');
		});
		//bind form submit 
		$(document).on('click','#updaterSubmit',function(e){
			var button =$(this);
			button.attr("disabled","true");
			
			alertify.confirm('Are you sure to submit?',function(e){
				if(e){
					var container = $(updaterDiv).find('.innerForm');
					var ajaxData = {};
					for(var fIdx in options.fields){
						var field = options.fields[fIdx];
						var name = field.name;
						if(isEmpty(name)){
							continue;
						}
						
						var fvalue = container.find('[name='+name+']').val();
						if(isEmpty(fvalue)){
							continue;
						}
						
						ajaxData[name] = fvalue;
					}
					defaultAjaxOpts.data = ajaxData;
					defaultAjaxOpts.data.id = defaultAjaxOpts.row.data().id;
					
					try{
						submitForm(options);
						alertify.success('update success');

					}catch(err){
						console.log('Updater sumbit fail,may be caused by server error,maybe caused by DataTable api.');
						alertify.error('Updater sumbit fail');
						$(button).attr("disabled",false);
						return;
					}
					$(button).attr("disabled",false);
					//everything is success, close updater-layer ,quit;
					toggleUpdaterElms('close');
									
				}else{
					$(button).attr("disabled",false);
					return;
				}
			});
			
			
		});
	}
	
	var submitForm = function(options){
		var ajaxOpts = $.extend(defaultAjaxOpts , options.ajax);
		
		ajaxOpts.success=function(j){
			if(isEmpty(defaultAjaxOpts.row)){
				throw 'Submit success,update row in table,but donot know which row to update,';
			}
			updateRow(options);
		}
		
		$.ajax(ajaxOpts);
	}
	
	var updateRow = function(options){
		var row = defaultAjaxOpts.row;
		var ajaxData = defaultAjaxOpts.data;
		var fields = options.fields;
		var table = options.table;
		var newData = row.data();
		
		for(var fIdx in fields){
			var field = fields[fIdx];
			newData[field.name]= ajaxData[field.name];
		}
		
		row.data(newData);
		//at last redraw table;
		table.draw();
	}
	
	var fillUpdaterForm = function(fields,row){
		if(!isArray(fields)){
			throw 'Updater fields param error! should be Array.'
		}
		if(isEmpty(row.data())){
			throw 'this row\'s data is empty,but it shouldnot be. error happens !'
		}
		var container = $(updaterDiv).find('.innerForm');
		//clear the form each time when updating new row;
		$(container).find('.paramRow').each(function(){
			$(this).remove();
		});
		
		$(container).find('.updaterLine').each(function(){
			$(this).remove();
		});
				
		var rowData = row.data();
				
		for(var fIdx in fields){
			var field = fields[fIdx];
			var name = field.name;
			if(isEmpty(name)){
				continue;
			}
			var label = field.label || '';
			var type = field.type || 'input';
			var insertHTML = chooseFieldHTMLTemplate(type);
			if(isEmpty(insertHTML)){
				continue;
			}
			var rowDiv = $('<div></div>');
			rowDiv.attr('class','paramRow');
			insertHTML=insertHTML.replace(/{label}/,label);
			insertHTML=insertHTML.replace(/{name}/,name);
			rowDiv.html(insertHTML);
			
			if(type=='select'){
				var options = field.options;
				if(!isArray(options)){
					continue;
				}
				var selectElm = rowDiv.find('[name='+name+']');
				
				var optsHTML = '';
				for(var optIdx in options){
					var option = options[optIdx];
					var optHTML = '<option value="{value}" {isSelected}>{label}</option>';
					if(isEmpty(option.label)||isEmpty(option.value)){
						continue;
					}
					optHTML= optHTML.replace(/{label}/,option.label);
					optHTML=optHTML.replace(/{value}/,option.value);
					if(option.value == rowData[name]){
						optHTML=optHTML.replace(/{isSelected}/,'selected=selected');
					}else{
						optHTML=optHTML.replace(/{isSelected}/,' ');
					}
					optsHTML += optHTML;
				}
				if(!isEmpty(optsHTML)){
					$(selectElm).html(optsHTML);
				}
				
			}else if(type=='date'){				
				console.log('[name='+name+']'+':value='+rowData[name]);
				rowDiv.find('[name='+name+']').val(rowData[name]);
				rowDiv.find('[name='+name+']').datepicker({
					dateFormat:"yy-mm-dd"  
				});
			}else{
				console.log('[name='+name+']'+':value='+rowData[name]);
				rowDiv.find('[name='+name+']').val(rowData[name]);
			}
			
			//append the rowDiv to container
			container.append(rowDiv);
			if(fIdx<fields.length-1){
				container.append(lineHTML);
			}
		}	
		
	}
	
	function isArray(object){
	    return  object && typeof object==='object' &&    
	            typeof object.length==='number' &&  
	            typeof object.splice==='function' &&    
	            !(object.propertyIsEnumerable('length'));
	}
	
	var chooseFieldHTMLTemplate = function(type){
		if(type=='date'){
			if($().datepicker){
				type = 'input';
			}
		}
		
		return fieldTemplate[type].html;
	}
	
	var hasUpdateCol = function(table){
		var ths = $(table).find('thead>tr>th');
		for(var idx in ths){
			var th = $(ths[idx]);
			if(th.hasClass('updaterCol')){
				upIdx = idx;
				upCol = th;
				return true;
			}else{
				continue;
			}
		}
		return false;
	}
	
	var toggleUpdaterElms = function(openOrClose){
		var updaterDiv = $('#updaterDiv');
		var updaterCover = $('#updaterCover');
				
		if(openOrClose=='close'){
			updaterDiv.hide();
			updaterCover.hide();
		}else if(openOrClose=='open'){
			updaterDiv.show();
			updaterCover.show();
		}else{
			//hide default
			updaterDiv.hide();
			updaterCover.hide();
		}	
	}
	
	var isEmpty = function(val){
		if(val==null ||val=='undefined' ||val==''){
			return true;
		}else{
			return false;
		}
	}
	
})(jQuery)