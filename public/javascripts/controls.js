var a=document.getElementById("dropDownAnchor");
a.onclick=function() {
	var dropDown=document.getElementById("dropDown");
	//dropDown.style.visibility="visible";
	event.preventDefault?event.preventDefault():returnValue=false;
}


var search=document.getElementById('search');
var a=document.getElementById('search-anchor');
a.onmousedown=function(){
  if(search.value==="") return;
  a.href="http://localhost:3000/search?keyword="+search.value;
};