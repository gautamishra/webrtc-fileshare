<?php
include 'connect1.php';

class req{
	public $fid;
	public $tid;
	public $data;
}
$data=$_POST['data'];
$data = json_decode($data);
$myId=$data->myId;
//echo $myId;
// code for DB

$query="SELECT * FROM server where remoteId=$myId";
$query_run=mysqli_query($link,$query);
$query_delete="DELETE FROM server where remoteId=$myId ";

if($query_run)
{
	$array=array();
	
	//echo "succesfull";
	while($result=mysqli_fetch_array($query_run,MYSQLI_ASSOC))
	{
	// printf("ID: %s  uid: %s data: %s", $result["id"], $result["remoteId"],$result["data"]);
	 $foo = new StdClass();
	 $foo->data =   $result['data'];
	 $foo->rid  =   $result['userId'];
	 $foo->mid  =   $result['messType'];
	 $foo->uid  =   $result['remoteId'];
	
   // var_dump($foo);
	
	array_push($array,$foo);
	
	}
	$response=new StdClass();
	$response->responses=$array;
	 $json = json_encode($response);
     echo $json;
	//printf($array);
}
else
{
	echo mysql.error;
}
mysqli_query($link,$query_delete);

?>