<?php
				// sleep(3);//задержка для проверки лоадера
error_reporting(E_ALL);
set_error_handler('myHandler', E_ALL);
$search = $_POST['search'];
$code = $_POST['code'];
		$j = file_get_contents( __DIR__ . DIRECTORY_SEPARATOR . 'kladr.json' ); // файл в корне
		$j = json_decode($j , true);

		if(!empty($_POST)){
			if($code==1)
			{
				searchStr();
			}
			if($code==2)
				dopDate();
		}	
		
		else echo 'нет данных';

		function myHandler($level, $message, $file, $line, $context) {
			if ($message!="")
			{
				header('HTTP/1.0 500 Internal Server Error', true);
				exit();
			}
		};
		function searchStr(){
			$res = array();
			$i=0; 		
			global $j,$search;
			if(is_numeric($search))
				while($i<count($j))
				{	
					if (strpos((string)$j[$i]["Id"], $search) ===0)
					{
						array_push($res, $j[$i]);	
					}
					$i++;
				}	
				else
					while($i<count($j))
					{	
						if (mb_stripos((string)$j[$i]["City"], $search) ===0)
						{
							array_push($res, $j[$i]);	
						}
						$i++;
					};	
					echo json_encode($res);
				};
		function dopDate(){
			$res = array();
			$i=0; 

			global $j,$search;

			while(($i<25)&&(count($j)>$i+$search))
			{	
				array_push($res, $j[$i+$search]);	
				$i++;
			}			
			echo json_encode($res);
		};
?>