
/*nav search*/
(function() {
	var search=document.getElementById('search');
	var a=getClass('search-anchor');
	a.onmousedown=function(){
	  if(search.value==="") return;
	  a.href="http://localhost:3000/search?keyword="+search.value;
	};
	/*nav dropdown*/
	var a=document.getElementById('dropDownAnchor');
	a.onclick=function(event){
		event.preventDefault?event.preventDefault():event.returnValue=false;
	};
})();
	
/*cross browsers compatibility function */
function getClass(className,ele){
	if(arguments[1]!==undefined) {
		if(!ele.tagName){
			console.log("error in getClass(className,ele) :arguments[1] must be a Element type!");
      return;
		}
		var element=ele;
	}
	else {
		var element=document;
	}
	if(document.getElementsByClassName) {
		return element.getElementsByClassName(className);
	}
	else {
		result=[];
		tags=element.getElementsByTagName("*");
		for (var i=0,len=tags.length;i<len;i++){
			var tagClass=tags[i].className;
			tagClassArr=tagClass.split(" ");
			for (var j=0,len=tagClassArr.length;j<len;j++) {
				if (tagClassArr[i]===className){
				  result.push(tags[i]);
				}
			}
		}
		return result;
	}
}

(function() {
	var articleText=getClass("article-main")[0];
	var tags=articleText.getElementsByTagName('*');
	var titleList=[];

	for (var i=0,len=tags.length;i<len;i++){
		var tagName=tags[i].tagName.toLowerCase();
		var title=tags[i].innerHTML;
		switch(tagName){
			case "h2":titleList.push({tag:tags[i],tagName:tagName,title:title});
			          break;
			case "h3":titleList.push({tag:tags[i],tagName:tagName,title:title});
			          break;
			case "h4":titleList.push({tag:tags[i],tagName:tagName,title:title});
			          break;
		}
	}
  var contentList=getClass("content-list")[0];
  for(var k=0,len=titleList.length;k<len;k++){
  	var a=document.createElement("a");
  	a.href="#articleContentHeader"+k;
  	titleList[k].tag.id="articleContentHeader"+k;
    a.appendChild(document.createTextNode(titleList[k].title));
    var li=document.createElement("li");
    li.appendChild(a);
    contentList.appendChild(li);
  }
  var highlight=getClass("content-highlight")[0];
  if(titleList.length!==0) {
  	highlight.style.display="block";
  }
  window.onscroll=function(){
	  for(var m=0,len=titleList.length;m<len;m++){
	  	var scrollTop=parseInt(
	  		      document.body.scrollTop?
	  		      document.body.scrollTop:
              document.documentElement.scrollTop
	  		      ,10);
	  	var offsetTop=parseInt(titleList[m].tag.offsetTop,10);
	  	if(50<offsetTop-scrollTop&&offsetTop-scrollTop< 80){
        highlight.style.top=21*m+"px";
	  	}
	  }
  };
})();
