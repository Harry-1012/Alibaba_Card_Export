//logger
var log = function(text){
    console.log(text);
}

var forceClose= false;
//Port Listener
var setupPort = function(port){
    port.onMessage.addListener(function(msg) {
        console.log(msg);
        if(msg.requestType == 'pageCount'){
            getPageCount(msg.cInfo.custID,function(data){
                sendMsg(port, data);
            });
        }
        else if(msg.requestType == 'getData'){
            gotoPageNew(msg.page,function(data){
                log("callback ,after export!");
                data.page =msg.page;
                data.dataResponse = true;
                sendMsg(port,data);
            });   
        }else if(msg.requestType == 'userInfo'){
            getUserInfo(function(info){
                sendMsg(port,{responseType:'userInfo',uInfo:info});
            });
        }
      });
}

//connecting port
var port = chrome.runtime.connect({name: "backP"});
console.log("setting up port");
setupPort(port);

//final export -- done
function exportData(doc,callback){
    console.log("exporting data");
    var cardList = [];
    var ulData =doc.getElementsByClassName('ui2-list-body list-body'); 
    var liData = ulData[0].getElementsByClassName('ui2-list-col list-card');
    for(var i = 0;i< liData.length;i++ ){
        var cardInfo = {};
        var frontCard = liData[i].querySelector('.card-front').querySelector('.card-main').querySelector('.desc');
        cardInfo.Name = frontCard.querySelector('.name').title;
        cardInfo.Position = frontCard.querySelector('.title').innerText;
        cardInfo.Company =  frontCard.querySelector('.company').title;
        cardInfo.Country = frontCard.querySelector('.country-name').innerText;
        var backCardLines = liData[i].querySelector('.card-back').querySelectorAll('.line');
        if(backCardLines[0].classList.contains('noinfo')){
            cardInfo.Email = '';
            cardInfo.Tel = '';
            cardInfo.Fax = '';
            cardInfo.Mob = '';
            cardInfo.Website = '';
        }else{
            for(var j=0;j<backCardLines.length;j++){
                var key = backCardLines[j].querySelector('.key').innerText;
                var value = backCardLines[j].querySelector('.val').title;
                switch(key){
                    case 'Email:':
                        cardInfo.Email = value;     
                        break;
                    case 'Tel:':
                        cardInfo.Tel = value;    
                        break;
                    case 'Fax:':
                        cardInfo.Fax = value;    
                        break;
                    case 'Mobile:':
                        cardInfo.Mob = value;    
                        break;
                    case 'Website:':
                        cardInfo.Website = value;    
                        break;
                    default:
                        break; 
                }
            }
    
        }
        var otherInfo = liData[i].querySelector('.time').innerText;
        var timeIdx = otherInfo.indexOf(',') + 6;
        cardInfo.From = otherInfo.substr(timeIdx);
        cardInfo.Time = otherInfo.substr(0,timeIdx);
        cardList.push(cardInfo);
    }
    
    //info.Name = document.getElementsByClassName('card-main')[0].childNodes[3].childNodes[1].title;
    console.log('export done');
    callback({data:cardList});
}

// goto need correct arguments
var gotoPageNew = function(pageNum,callback){   
    var url = createUrl(pageNum);
    loadXMLDoc(url,function(htmlContent){
        var parser = new DOMParser()
        var htmlDoc = parser.parseFromString(htmlContent, "text/html");
        exportData(htmlDoc,callback);
    });
}
var createUrl = function(pageNum){
   var url =  "https://profile.alibaba.com/receive_list.htm?";
       url += "time=" + (new Date()).getTime() + "&"; 
       url += "pageNum=" + pageNum + "&searchKey=&searchStatus=visible&filterBi=all&filterGs=all";
       //url += "ctoken=v9hzynuw_3md";
       url = mixCsrfToken(url);
       return url;
}
//function for sending Message to background
var sendMsg = function(port,msg){
    port.postMessage(msg);
}
function loadXMLDoc(theURL,callback)
    {
        try{
         var xmlhttp=new XMLHttpRequest();
         xmlhttp.onreadystatechange=function()
            {
                if (xmlhttp.readyState==4 && xmlhttp.status==200)
                {
                    callback(xmlhttp.responseText);
                }
            }
        xmlhttp.open("GET", theURL, false);
        xmlhttp.send();
    }
    catch(e){
        console.log(e);
        callback("");
    }
}
var mixCsrfToken = function(e) {
    var t = document.cookie;
    var r = t && t.match(/(?:^|;)\s*xman_us_t\s*=\s*([^;]+)/);
    if (r) {
        r = r[1].match(/(?:^|&)\s*ctoken\s*=\s*([^&]+)/)
    }
    var i = window["_intl_csrf_token_"] || r && r[1];
    if (i &&  /(\?|&)ctoken=/.test(e) === false) {
        e += (/\?/.test(e) ? "&" : "?") + "ctoken=" + i
    }
    r = t && t.match(/(?:^|;)\s*_tb_token_\s*=\s*([^;]+)/);
    if (r && /^https?:\/\/(onetouch|onetouch-partner|jsb|fin|fin-partner)\.alibaba\.com\//.test(location.href) && /(\?|&)_tb_token_=/.test(e) === false) {
        e += (/\?/.test(e) ? "&" : "?") + "_tb_token_=" + r[1]
    }
    return e
}
var checkMorePages = function(htmlDoc){
    var spans = document.querySelectorAll('.ui2-pagination-pages')[0].querySelectorAll('span');
    hasMorePages = true;
    if(spans[spans.length-1].innerText == "Next" && spans[spans.length-1].className.contains("disable")){
        hasMorePages = false;
    }
    console.log("morepages" + hasMorePages);
    return hasMorePages;
}
var getPageCount = function(pageUrl,callback){
    var url = createUrl(1,pageUrl);
    loadXMLDoc(url,function(htmlContent){
        var parser = new DOMParser()
        var htmlDoc = parser.parseFromString(htmlContent, "text/html");
        var pageList = document.querySelectorAll('.ui2-pagination-pages')[0].querySelectorAll('a');
        var spanList = document.querySelectorAll('.ui2-pagination-pages')[0].querySelectorAll('span');
        if(pageList.length == 0 && spanList.length > 0){
            callback({pageCount:spanList[spanList.length-2].innerText});
        }else if(pageList.length > 0){
            callback({pageCount:pageList[pageList.length-2].innerText});
        }else{
            callback({pageCount:0});
        }
    });
}
var getUserInfo = function(callback){
    // var url = "https://accounts.alibaba.com/user/get_account_profile.htm";
    // url = mixCsrfToken(url);
    // console.log('getting user info : '+url);
    // loadXMLDoc(url,function(jsonContent){
    //     var info = jsonContent ==""?"":JSON.parse(jsonContent);
    //     callback(info);
    // });
    var customerId = '';
    var userName = '';
    var t = document.cookie;
    var r = t && t.match(/(?:^|;)\s*xman_us_t\s*=\s*([^;]+)/);
    if (r) {
        s = r[1].match(/(?:^|&)\s*x_lid\s*=\s*([^&]+)/)
        if(s){
            customerId = s[1];
        }
    }
    var u = t && t.match(/(?:^|;)\s*xman_us_f\s*=\s*([^;]+)/);
    if(u){
        v = u[1].match(/(?:^|&)\s*x_user\s*=\s*([^&]+)/);
        if(v){
            userName = (v[1].split('|'))[1];
        }
    }
    var info = {
        loginId:customerId,
        uName:userName
    };
    callback(info);
}