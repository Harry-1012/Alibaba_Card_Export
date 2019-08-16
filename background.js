var frontP = {};
var backP = {};
var ExtStatus = {
  NotStarted: 1,
  Running: 2,
  Completed: 3
}
var currentData = {
  status: ExtStatus.NotStarted,
  popupClosed: true,
  startPage: 0,
  endPage: 0,
  currentPage: 0,
  contactData: [],
  lastPage: 0
};
var custInfo = {
  custID:'',
  type:0,
  cD:0
};

// to change title chrome.browserAction.setTitle({title :"Hi"});
// chrome.browserAction.setBadgeText({text:"?"});
//1.
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name == "frontP") {
    frontP = port;
    setupFrontPort();
  } else if (port.name == "backP") {
    backP = port;
    setupBackPort();
    sendReqRes(backP,{requestType:'userInfo'});
  }
});


var setupFrontPort = function () {
  frontP.onMessage.addListener(
    function (msg) {
      if (msg.requestType == 'initPopup') {
        handleInitPopup(msg);
      } else if (msg.requestType == 'close') {
        currentData.popupClosed = true;
      } else if (msg.requestType == 'export') {
        handleExport(msg);  
      }

    });
  frontP.onDisconnect.addListener(function (arg) {
    currentData.popupClosed = true;
  });
}

var handleInitPopup = function(msg){
  currentData.popupClosed = false;
  if(msg.custID == ""){
    sendReqRes(frontP,{responseType: 'initError'});
  }else{
  switch (currentData.status) {
    case ExtStatus.NotStarted:
      if(Number(custInfo.type) == 0 || Number(custInfo.type) == 2){
        currentData.lastPage = 1;
        sendReqRes(frontP, {pageCount:'1'});
      }else{
        sendReqRes(backP, {
        requestType: 'pageCount'
        });
      }
      break;
    case ExtStatus.Running:
    case ExtStatus.Completed:
      sendReqRes(frontP,currentData);
      break;
    default:
      break;
  }
}
}

var startExport = function (msg) {
  currentData.startPage = msg.fromPage;
  currentData.endPage = (Number(currentData.lastPage) > Number(msg.toPage) ? Number(msg.toPage) : Number(currentData.lastPage));
  currentData.currentPage = msg.fromPage;
  currentData.status = ExtStatus.Running;
  sendReqRes(backP, {
    requestType: 'getData',
    page: msg.fromPage,
    
  });
}

var setupBackPort = function () {
  backP.onMessage.addListener(
    function (msg) {
      if(msg.pageCount){
        sendReqRes(frontP,msg);
        currentData.lastPage = msg.pageCount;
      }else
      // if data received
      if (msg.dataResponse == true) {
        console.log('data received'+msg.data.length);
        //update local copy
        currentData.contactData = currentData.contactData.concat(msg.data);
        currentData.currentPage = msg.page;
        //if popup is opened send data to client
        sendReqRes(frontP, {
          data: msg.data,
          page: msg.page
        });
        var badgeText = msg.page.toString() +"/"+currentData.endPage;
        chrome.browserAction.setBadgeText({text:badgeText});
        custInfo.cD = Number(custInfo.cD)+Number(msg.contactCount);
        if(Number(custInfo.type)==0 ){
          sendReqRes(frontP, {
            hasMorePages: false
          });
          currentData.status = ExtStatus.Completed;
        } else 
        //check last page
        if (Number(msg.page) < Number(currentData.endPage)) {
          sendReqRes(backP, {
            requestType: 'getData',
            page: Number(msg.page) + 1
          });
        } else {
          sendReqRes(frontP, {
            hasMorePages: false
          });
          currentData.status = ExtStatus.Completed;
        }

      }else if(msg.responseType = 'userInfo'){
        if(msg.uInfo){
          custInfo.custID = msg.uInfo.loginId;
          checkRegisteration(custInfo.custID,function(resp){
            var respData =  getRespData(resp);
            custInfo.type = respData[6];
            custInfo.custId = respData[0];
          });
        }else{
          custInfo.custId = '';
        }
        
      }
    });
  backP.onDisconnect.addListener(function (arg) {
    resetData();
    window.console.log("bPort disconnected! ");
  });
}

var resetData = function(){
  currentData.status = ExtStatus.NotStarted;
  currentData.popupClosed = true;
  currentData.startPage = 0;
  currentData.endPage = 0;
  currentData.currentPage = 0;
  currentData.contactData = [];
  currentData.lastPage = 0;
  frontP = {};
  backP = {};
  chrome.browserAction.setBadgeText({text:''});
  custInfo.custID='';
  custInfo.type=1;
  custInfo.cD=0;
}

var handleExport = function(msg){
  checkStatus(custInfo.custID,custInfo.custId,function(resp){
    var respData =  getRespData(resp);
    custInfo.type = respData[6];
    custInfo.cD = respData[7];
    startExport(msg);
  });

}


var sendReqRes = function (port, msg) {
  if ((port.name == 'frontP' && currentData.popupClosed == false) || (port.name == 'backP')){
    msg.cInfo = custInfo;  
    port.postMessage(msg);
  }
}