var currentStatus = chrome.extension.getBackgroundPage().open = 0;
if (currentStatus == 0) {
    chrome.extension.getBackgroundPage().open = 1;
} else {
    chrome.extension.getBackgroundPage().open = 0;
    window.close();
}


/*Helper functions*/
//logger
var log = function (text) {
    console.log(text);
}

//Popup Loading
var portF = null;
$(document).ready(function () {
    initUI(); // ui only
    initPort();
    $('#btnStart').click(function () {
        $('#loader').text("Loading data.. Please wait..");
        doExport();        
    });
    initPopup();
});
//Port Initialise
var initPort = function () {
    var port = chrome.runtime.connect({
        name: "frontP"
    });
    portF = port;
    console.log('popup <> background port init');
    setupPort(port);
    log("port setup complete!!");
}
//Port Listener
var setupPort = function (port) {
    port.onMessage.addListener(function (resp) {
        if (resp.pageCount) {
            switch(Number(resp.cInfo.type)){
                case 0:
                case 2: 
                        updatePageCountUI("1", resp.pageCount);
                        updateTrialRunningUI(resp.cInfo.custID);
                    break;
                case 1:
                    updatePageCountUI("1", resp.pageCount,resp.cInfo.custID);
                    break;
            }
        } else if (resp.data) {
            updateUI(resp.data,resp.page,Number(resp.cInfo.type),Number(resp.type),resp.cInfo.custID);
        } else if (resp.hasMorePages == false) {
            updateUILoadComplete(resp.cInfo.custID);
        } else if (resp.popupClosed == false) {
            $('#Container').show();
            debugger;
            updateUI(resp.contactData,resp.currentPage,Number(resp.cInfo.type),Number(resp.type),resp.cInfo.custID,resp.startPage,resp.endPage);
        } else if(resp.trialExpired == true){
            updateTrialEndUI();
        } else if(resp.responseType = 'userInfo'){
            if(resp.error){
                updateErrorUI(); //to implement
            }else{
                //Todo::
            }
        }else if(resp.responseType == 'initError'){
                updateErrorUI();
        }
    });
}

var initPopup = function () {
    sendMsg(portF, {
        requestType: 'initPopup'
    });
}


$(window).unload(function () {
    sendMsg(portF, {
        requestType: 'close'
    });
});


//Export
var doExport = function () {
    var fromP = $('#txtStartPage').val();
    var endP = $('#txtEndPage').val();

    if( Number(fromP) <  Number($('#txtStartPage').data('minval')) || fromP >  Number($('#txtStartPage').data('maxval')) ){
        return;
    }
    if(Number(endP) <  Number($('#txtEndPage').data('minval')) || Number(endP) >  Number($('#txtEndPage').data('maxval'))){
        return;
    }
    $('#Container').show();
    $('#btnStart').attr('disabled', 'disabled');
    $('#btnStart').val('Loading..');

    sendMsg(portF, {
        requestType: 'export',
        fromPage: fromP,
        toPage: endP
    });
};


//function for sending Message to background
var sendMsg = function (port, msg) {
    port.postMessage(msg);
}