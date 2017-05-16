	var cities=[];//основной массив данных
	var lastElem=0;//номер последнего элемента показанного в Автокомплите
	var load=false;//флаг для проверки идет ли в данный момент загрузка
	var endMass = false;//флаг для проверки есть ли еще данные в массиве на сервере
	var flagError = false;//флаг ошибки при загрузке данныъх
	var inpStr = "";//строка запроса
	$(document).ready(function(){
		addEventListener("keydown", keyboard);
		$("#inp").on("input", function(){ input()});

		$(".dropdown-menu").scroll(function(){
			if(this.scrollTop==this.scrollHeight-this.clientHeight)
			{
				if((!load)&&(!flagError)) 
					loadDate();
					$(".dropdown-menu").scrollTop($(".dropdown-menu").scrollTop()+5);//для авто прокрутки
			}
		});
	//поле получило фокус
	$("#inp").focus(function(){
		$("#inp").parent().children("p.error").text("");	
		$("#inp").removeClass("error");
		$(".dropdown-menu> li.active").removeClass("active");
		$(".dropdown-menu").show();
		if(($(".select").length != 0))
		{
			$(".select").addClass("active");
			var scrollTop = $($(".dropdown-menu> li.active")).position().top;
			var height = $(".dropdown-menu").scrollTop();		
			$(".dropdown-menu").scrollTop(scrollTop+height);
		}
		else
		{
			$(".dropdown-menu> li:not(*[id]):eq(0)").addClass("active");
			$(".dropdown-menu").scrollTop("0");
		}
		if(inpStr=="")
		{
			$("#inp").addClass("active");
			if(($(".dropdown-menu > li:not(*[id])").length == 0)&&(!load))
			{
				lastElem=0;
				getDate(2);
			}			
		}
			$(this).select();		
	});

	//поле потеряло фокус
	$("#inp").focusout(function(){
		$(".dropdown-menu").hide();
		$("#inp").removeClass("active");
		if((($("#loader").length==1)&&($(".select").length==0))||($(".dropdown-menu").find("li#lastLine").text()==" Совпадений не найдено "))
		{
			$("#inp").addClass("error");
			$("#inp").parent().children("p.error").text("Выбирите значение из списка");
		}
	});
})

	//функция робатывающая при вводе в input
	function input(){
		inpStr = $.trim($("#inp").val());
		if(inpStr!="")
			getDate(1);
		else
		{
			$('.dropdown-menu').empty();
			lastElem=0;
			endMass = false;
			cities=[];
			getDate(2);
		}
	}
//работа с мышью
function mouse(){
	$(".dropdown-menu > li:not(*[id])").mouseenter(function(){
		$("body").css("overflow","hidden");
		var t = $(".dropdown-menu > li.active");
		if($(".dropdown-menu > li.active").length != 0 )
			$(".dropdown-menu > li.active:eq(0)").removeClass("active");
		$(this).addClass("active");
		autoScroll();
	})
	$(".dropdown-menu > li:not(*[id])").mouseleave(function(){
		$("body").css("overflow","auto");
		$(this).removeClass("active");
	});
	$(".dropdown-menu > li:not(*[id])").mousedown( function(){
		enter();
	})
}

//выбор варианта в меню
function enter(){
	if($(".dropdown-menu > li.active").hasClass("refresh"))
		input();
	else
	{
		var k = $(".dropdown-menu > li.active").find(".divId").text();
		var k1 = $(".dropdown-menu > li.active").find(".divText").text()
		$("#inp").val(k+' '+k1);
		$(".select").removeClass("select");
		$(".dropdown-menu > li.active").addClass("select");
		// inpStr = $.trim($("#inp").val());
	}
}

//авто скролл 
function autoScroll()
{
	if($(".dropdown-menu> li.active").length!=0)
	{
		var scrollTop = $($(".dropdown-menu> li.active")).position().top;
		var t = $($(".dropdown-menu > li.active")).height();
		var height = $(".dropdown-menu").outerHeight();

		if($($(".dropdown-menu> li.active")).position().top<0)
		{
			$(".dropdown-menu").scrollTop($(".dropdown-menu").scrollTop()-t);
		}
		if($($(".dropdown-menu> li.active")).position().top+t>$(".dropdown-menu").outerHeight())
		{
			$(".dropdown-menu").scrollTop($(".dropdown-menu").scrollTop()+t);
		}
	}		
}

//отправка запроса серверу и получение данных
function getDate(code){
	var timeId1;
	var request="";
	switch (code)
	{
		case 2:
		request=lastElem;
		break;
		case 1:
		if (inpStr.length==1)
		{
			request=inpStr;
			$('.dropdown-menu').empty();
		}
		break;
	}
	if($("#errorLoad").length != 0)
	{
		$("#errorLoad").remove();
		$(".refresh").remove();
	}
	if(request!=="")
		$.ajax({
			type:"POST",
			url:"ajax/search.php",
			data:{
				search: request,
				code:code
			},
			beforeSend: function(){
				load = true;
				$("#inp").attr("readonly",true);
				timeId1 = setTimeout(function(){	
					if($("#loader").length==0)
					{
						$(".dropdown-menu").append('<li id = "loader"><div class="glyphicon glyphicon-refresh refresh-anim"></div>  Загрузка</li>');				
						$(".dropdown-menu").scrollTop($(".dropdown-menu").scrollTop()+26);
						$(".dropdown-menu").show();	
						setTimeout("sleep(990)",10);
					}
				},500);
			},
			success: function(data){
				load = false;
				$("#inp").attr("readonly",false);
				$("#loader").remove();

				// $(".dropdown-menu").show();
				clearTimeout(timeId1);
				flagError = false;
				switch (code){
					case 2:
						if(JSON.parse(data).length == 0)
							endMass=true;
						for (var i = 0; i < JSON.parse(data).length; i++) {
							cities.push(JSON.parse(data)[i]);
						}
						loadDate();
						break;
					case 1:
						cities = JSON.parse(data);
						write();
					break;
				}			
			},
			error: function(){			
				load = false;
				$("#inp").attr("readonly",false);
				$("#loader").remove();
				clearTimeout(timeId1);
				$(".dropdown-menu").show();	
				flagError=true;
				$(".dropdown-menu> li.active").removeClass("active");
				$(".dropdown-menu").append('<li id = "errorLoad">Что-то пошло не так. Проверьте соединение с интернетом и попробуйте еще раз</li>');
				$(".dropdown-menu").append('<li class="refresh active"><a>Обновить</a></li>');	
				mouse();
				autoScroll();
			}
		});
	else
		if(!load)
			write();
	}

	function sleep(ms) {
		ms += new Date().getTime();
		while (new Date() < ms){}
	} 


//подгрузка данных в меню
function loadDate()
{
	$('#lastLine').remove();
	if((inpStr=="")&&(lastElem==cities.length)&&(!endMass))
		getDate(2);
	else
		{
			var i=lastElem;

			while((lastElem<25+i)&&(lastElem<cities.length))
			{			
				var s ="";
				if(lastElem == 0)
					s="class = 'active'";					
				$('.dropdown-menu').append('<li '+s+'><a><div class= row><div class= "divId col-md-2 pull-left ">'+ cities[lastElem].Id+'</div>\
					<div class= "divText col-md-10 pull-left">' + cities[lastElem].City + '</div></div></a></li>');				
				lastElem++;	
			};
			mouse();
		}
	}

//сортировка данных при вводе 
function  write() {	
		var maxCol = 25;	//кол-во максимально отображаемых вариантов
		var col = 0;
		var i = 0;
		$('.dropdown-menu').empty();
		if(inpStr!="") 
		{
			var str = inpStr.split(' ');
			
			while((col<maxCol)&&(i<cities.length))
			{		
				if((cities[i].City.toLowerCase().indexOf(inpStr.toLowerCase())==0)||(String(cities[i].Id).indexOf(inpStr)==0)||((cities[i].Id+' '+cities[i].City).indexOf(inpStr)==0))
				{
					var s="";
					if(col == 0)
						s="class = 'active'";					
					$('.dropdown-menu').append('<li '+s+'><a><div class= row><div class= "divId col-md-2 pull-left">'+ cities[i].Id+'</div>\
						<div class= "divText col-md-10 pull-left">' + cities[i].City + '</div></div></a></li>');			
					col++;
					lastElem=i;
				}
				i++;
			}
		}
		if(col==0)
			$('.dropdown-menu').append('<li id = "lastLine" > Совпадений не найдено </li>');				
		mouse();
	}


// работа с клавиатурой
function keyboard(e){

	switch(e.keyCode){
    	case 13:   // клавиша enter
    	enter();
    	$("[tabindex = '"+ (Number($(":focus").attr("tabindex"))+1) +"']").focus();
    	break;
        case 38:   // клавиша вверх
        e.preventDefault();
        moveMenu(-1);
        break;
        case 27:   // клавиша esc
        $(".dropdown-menu").hide();
        break;
        case 40:   // клавиша вниз
        e.preventDefault();
        moveMenu(1);
        break;
      }
    }

    function moveMenu(i){
    	var col =  $(".dropdown-menu > li:not(*[id])").length
    	var n = $(".dropdown-menu > li.active").index();
    	
    	if(n!=-1)
    	{
    		
    		if((n+i<col)&&(n+i>=0))
    		{
    			$(".dropdown-menu > li:not(*[id]):eq("+n+")").removeClass("active");
    			$(".dropdown-menu > li:not(*[id]):eq("+(n+i)+")").addClass("active");
    		}
    	}
    	else
    	{
    		if(col!=0)
    		{
    			if(i==1)
    			{
    				$(".dropdown-menu > li:not(*[id]):eq(0)").addClass("active");
    				$(".dropdown-menu").scrollTop("0");
    			}
    		}
    	}
    	autoScroll();
    }