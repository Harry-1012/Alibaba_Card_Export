var apiHost = 'http://webbtb.com/';
var checkRegisteration = function (custDomain, callback) {
    var reqData = getReqData(Base64.encode(custDomain) + ":" + "undefined" + ":" + getTodayDate());
    callAPI('api/Ext/r', reqData, function (res) {
        callback(res);
    }, function (err) {
        alert(err);
    });
}

var getReqData = function (rData) {
    var reqData = Base64.encode(rData).replace('=', '').replace('=', '').split('').reverse().join('');
    return reqData;
}
var getRespData = function(rData){
    var differce = 4 - (rData.length % 4 == 0 ? 4 : rData.length % 4);

    var respData = rData.split('').reverse().join('');
    if(String.prototype.padEnd){
        respData = respData.padEnd(rData.length+differce,"=");   
    }else{
        respData = padEnd(respData,rData.length+differce,"=");
    }
    respData = Base64.decode(respData);
    return respData.split(':');
}
var checkStatus = function (custDomain,custId,callback) {
    var reqData = getReqData(Base64.encode(custDomain) + ":" + custId);
    callAPI('api/Ext/e', reqData, function (res) {
        callback(res);
    }, function (err) {
        alert(err);
    });

};


var getCustName = function () {

};

var getTodayDate = function () {
    var date = new Date();
    var day = date.getDate() > 9 ? date.getDate().toString() : ('0' + date.getDate().toString());
    var month =  (date.getMonth() + 1) > 9 ?(date.getMonth() + 1).toString(): ('0'+(date.getMonth() + 1).toString()); 
    return (day + "-" + month + "-" + date.getFullYear());
};

var callAPI = function (Url, data, cbSuccess, cbError) {
    try {
        $.ajax({
            type: "POST",
            url: apiHost + Url + "/" + data,
            async: false,
            success: function (result) {
                    cbSuccess(result);
            },
            error: function (resp, err, res) {
                cbError(res);
            }
        });
    } catch (e) {
        cbError(e.message);
    }

}

var padEnd = function(data,totalLenght,padChar){
    return (totalLenght > data.length) ? padEnd(data+padChar,totalLenght,padChar):data;
}
