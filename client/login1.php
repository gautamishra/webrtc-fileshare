<?php
include "connect1.php";
	$data =$_REQUEST['data'];
	$data = json_decode($data);
	 $userId     =      $data->uid;
	$remoteId    =      $data->rid;
	$messId      =      $data->mid;
	$description =      $data->data;
	
	
	$query="INSERT INTO server VALUES('','$remoteId','$userId','$messId','$description')";
	$query_run=mysqli_query($link,$query);
	if($query_run)
	{
		echo "your data is saved in table";
	}
	else
	{
		echo mysqli_error($link);
	}
	
	
?>