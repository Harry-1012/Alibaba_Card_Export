var initUI = function(){
    $('#Header2').hide();
    $('#Container').hide();
    $('#btnExport').hide();
    $('#btnStart').show();
    $('#btnStart').val('Start');
    $('#btnStart').attr('title','Start loading contacts..');
    $('#loader').text("Click Start to load contacts..");
    $('#txtStartPage').hide();
    $('#txtEndPage').hide();
    $('#lblStartPage').hide();
    $('#lblEndPage').hide();
    $('#txtStartPage').val('');
    $('#txtEndPage').val('');
}
var updateErrorUI = function(){
    $('#custStatus').text('Error! Please refresh!');
    $('#custStatus').show();
    initUI();

}

var updateTrialRunningUI =function(urlInfo){
    $('#custStatus').text('Trial');
    $('#custStatus').show();
    $('#txtStartPage').hide();
    $('#txtEndPage').hide();
    $('#Header2').show();
    
}
var updatePageCountUI = function(startPage,endPage){
    $('#custStatus').text('Premium');
    $('#custStatus').show();
    $('#txtStartPage').val(startPage);
    $('#txtEndPage').val(endPage);
    $('#txtStartPage').data('maxval',endPage);
    $('#txtEndPage').data('maxval',endPage);
    $('#txtStartPage').show();
    $('#txtEndPage').show();
    $('#lblStartPage').show();
    $('#lblEndPage').show();
    $('#Header2').show();
}
var updateUILoadComplete=function(urlInfo){
    //all data loaded
    $('#loader').text("All data loaded.. Click Export to download!!");
    document.getElementById('btnExport').removeAttribute("disabled");
    $('#btnStart').hide();
    $('#btnExport').show();
}
var updateUI= function(data,page,type,processStatus,urlInfo,firstpage,lastpage){
    $('#Header').show();
    $('#Header2').show();
    if(type == 0 || type == 2){
        $('#custStatus').text('Trial');
        $('#custStatus').show();
        $('#txtStartPage').hide();
        $('#txtEndPage').hide();
        $('#lblStartPage').hide();
        $('#lblEndPage').hide();
    }else{
        $('#custStatus').text('Premium');
        $('#custStatus').show();
        $('#txtStartPage').show();
        $('#txtEndPage').show();
        $('#lblStartPage').show();
        $('#lblEndPage').show();
    }
    if(processStatus == 3){
        updateUILoadComplete();
    }else{
        $('#loader').text("Loading data.. Please wait.. Page " + (page) + " loaded..");
        $('#btnStart').attr('disabled', 'disabled');
        $('#btnStart').val('Loading..');
    }
    $('#txtStartPage').attr('disabled','disabled');
    $('#txtEndPage').attr('disabled','disabled');
    

    $(data).each(function(el) {
        var markup = getRow(data[el]);
        $('#tblContacts tbody').append(markup);    
    });
    if(typeof firstpage != 'undefined'){
        $('#txtStartPage').val(firstpage);
    }
    if(typeof lastpage != 'undefined'){
        $('#txtEndPage').val(lastpage);
    }
    if(typeof lastpage != 'undefined' && page == lastpage){
        updateUILoadComplete(urlInfo);
    }

}

var getRow = function(data){
    var tr = '<tr>';
    tr += getColumn(data.Name);
    tr += getColumn(data.Position);
    tr += getColumn(data.Company);
    tr += getColumn(data.Country);
    tr += getColumn(data.Email);
    tr += getColumn(data.Tel);
    tr += getColumn(data.Fax);
    tr += getColumn(data.Mob);
    tr += getColumn(data.Website);
    tr += getColumn(data.From);
    tr += getColumn(data.Time);
    tr += '</tr>';
    return tr;
};

var getColumn = function(data){
    if(data)    
        data = data.trim();
    return '<td>' + data +'</td>';
};

