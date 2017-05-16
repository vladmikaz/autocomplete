var menu="";
var idF = "";
var inpStr ="";
$(document).ready(function(){	
	addEventListener("keydown", keyboard);
	$("input.drop").on("input", function() {
		inpStr = $.trim($(idF).val());
		write()
	});

	//поле получило фокус
	$("input.drop").focus(function(){

		idF = "#"+ $(this).attr("id");
		menu = "#"+ $(this).parent().find(".dropdown-menu").attr("id");	
		inpStr = $.trim($(idF).val());
		$(idF).parent().children("p.message").className="message";
		$(idF).parent().children("p.message").text("");	
		$(idF).removeClass("error");
		$(idF).removeClass("warning");
		
		if(inpStr=="")
		{
			favorites();
			$(menu).show();
			$(idF).addClass("active");
		}
		else
			$(this).select();
		if($(menu+"> li.select").length==0)
			$(menu).show();
	});

	//поле потеряло фокус
	$("input.drop").focusout(function(){		
		$(menu).hide();
		$(idF).removeClass("active");

		if(($(menu+">.select").length==0)&&(inpStr!="")&&(idF=="#inpCountry"))
		{
			$(idF).addClass("error");
			$(idF).parent().children("p.message").addClass("error");
			$(idF).parent().children("p.message").text("Добавьте значение в справочник, или выбирите другое значение");
		}
		if(($(menu+" > .select").length==0)&&(inpStr!="")&&(idF=="#inpTown"))
		{
			$(idF).addClass("warning");
			$(idF).parent().children("p.message").addClass("warning");
			$(idF).parent().children("p.message").text("Такого значения нет, возможно вы ошиблись в написании");
		}
		idF = "";
		menu = "";
	});	
})


//поиск по вхождению
function multSearch(str,substr){
	var mas=str.split(' ');
	var rezult="";
	for(var i=0; i<mas.length;i++)
	{
		if (mas[i].replace(new RegExp("['«»]",'g'), '').toLowerCase().indexOf(substr.replace(new RegExp("['«»]",'g'), '').toLowerCase())==0) 
			mas[i] = mas[i].replace(new RegExp(substr,'i'), '<b>$&</b>');
		if(i!=0)
			rezult +=" ";
		rezult +=mas[i];
	}
	if (rezult!=str)
		return rezult;
	else
		return "";
}


//добавление своего значения
function addDate(){
	switch(idF)
	{
		case "#inpCountry":
		countries.push({Id:countries.length,Country: inpStr});
		break;
		case "#inpTown":
		cities.push({Id:countries.length,City: inpStr});
		break;
	}
}

//выбор варианта в меню
function enter(){
	if($(menu+"> li.active").hasClass("add"))
		addDate();
	else
	{
		$(idF).val( $(menu+"> li.active > a").text());
		inpStr = $.trim($(idF).val());
	}
		write();
		$(menu+" >.select").removeClass("select");
		$(menu+" > li.active").addClass("select");
}

// ввод в инпут 
function  write() {	
		var maxCol = 5;	//кол-во максимально отображаемых вариантов
		var col=0; //кол-во найденных вариантов
		$(menu).empty();
		$(menu).show();
		
		if(inpStr!="")
		{
			var mas;
			var elem;
			var i =0;
			var addFlag=true;
			switch(idF)
			{
				case "#inpCountry":
				mas = countries;
				break;
				case "#inpTown":
				mas = cities;
				break;
			}
			for(i=0; i<mas.length;i++)
			{	
				switch(idF)
				{
					case "#inpCountry":
					elem=mas[i].Country;
					break;
					case "#inpTown":
					elem=mas[i].City;
					break;
				}

				var str ="";
				if (elem.toLowerCase().indexOf(inpStr.toLowerCase())==0) 
					str = elem.replace(new RegExp(inpStr,'i'), '<b>$&</b>');//поиск по целой строке
				else
					str = multSearch(elem,inpStr);//поиск по вхождению

				
				if(str!="")
				{				
					if(col<maxCol)
					{
						var s="";
						if(col == 0)
							s="class = 'active'";					
						$(menu).append('<li '+s+'><a>' + str + '</a></li>');			
					}		
					col++;
				}
				if(elem.toLowerCase()==inpStr.toLowerCase())
				{
					addFlag=false;
					$(menu+">li.active").removeClass("active");
					if(col-1>=maxCol)
						maxCol++;					
					else
						$(menu+" > li:not(*[id]):eq("+(col-1)+")").remove();
					$(menu).prepend('<li class="active select"><a><b>' + str + '</b></a></li>');
				}
				
			}
			if(addFlag)
			{
				$(menu).append('<li class = "add"><a>+Добавить «' +inpStr+'»</a></li>');
				if(col == 0)
					$(menu+"> li.add").addClass("active");			
			}
		}

		if(col>maxCol)
			$(menu).append('<li id = "lastLine"> Показано '+maxCol+' из ' + col + ' найденных cсовпадений. </li>');	
		else
		{
			$(menu+">#lastLine").remove();
			// if(col==0) 
			// {
			// 	$(menu).append('<li id = "lastLine" > Совпадений не найдено </li>');				
			// }
			if(inpStr=="")
				favorites(); 
		}
		mouse();
	}

// популярные варианты
function favorites(){
	if(inpStr=="")
	{
		var mas;
		switch(idF)
		{
			case "#inpCountry":
			mas = ["страны","Россия","Великобритания","Китай"];
			break;
			case "#inpTown":
			mas = ["города","Екатеринбург","Новосибирск","Москва"];
			break;
		}
		$(menu).empty();	
		$(menu).append('<li id = "lastLine"> Популярные '+mas[0]+'</li>');
		$(menu).append('<li><a>'+mas[1]+'</a></li>');
		$(menu).append('<li><a>'+mas[2]+'</a></li>');
		$(menu).append('<li><a>'+mas[3]+'</a></li>');
		mouse();
	}
}

//работа с мышью
function mouse(){
	$(menu+"> li:not('#lastLine')").mouseenter(function(){
		if($(menu+">li.active").length != 0 )
			$(menu+">li.active").removeClass("active");
		$(this).addClass("active");
	})
	$(menu+">li:not('#lastLine')").mouseleave(function(){
		$(this).removeClass("active");
	});
	$(menu+">li:not('#lastLine')").mousedown( function(){
		enter();
	})
}

// работа с клавиатурой
function keyboard(e){
	if($("input:focus").length)
		switch(e.keyCode){
    	case 13:   // клавиша enter
    	if(idF!="")
    		enter();
    	e.preventDefault();
    	$("[tabindex = '"+ (Number($(":focus").attr("tabindex"))+1) +"']").focus();
    	break;
        case 38:   // клавиша вверх
        e.preventDefault();
        moveMenu(-1);
        break;
        case 27:   // клавиша esc
        $(menu).hide();
        break;
        case 40:   // клавиша вниз
        e.preventDefault();
        moveMenu(1);
        break;
    }
 }


 //перемещение по меню
 function moveMenu(i){
 	var col =  $(menu+" > li:not(*[id])").length
 	var n = $(menu+" > li.active").index();
 	if((inpStr=="")&&(n!=-1))
 		n--;
 	if(n!=-1)
 	{
 		$(menu+" > li:not(*[id]):eq("+n+")").removeClass("active");
 		if((n+i<col)&&(n+i>=0))
 		{  			
 			$(menu+" > li:not(*[id]):eq("+(n+i)+")").addClass("active");
 		}
 	}
 	else
 	{
 		if(col!=0)
 		{
 			if(i==1)
 			{
 				$(menu+" > li:not(*[id]):eq(0)").addClass("active");
 			}
 			else
 				$(menu+" > li:not(*[id]):eq("+(col-1)+")").addClass("active");
 		}
 	}
 }
