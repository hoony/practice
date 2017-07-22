var socket; // client socket
var socketOption = {
    ...
    ..
};
var channels = [];
var newChannel = [];
var oldChannel = [];
var totalPlaylist = {};

//초기 페이지 로드 또는 새로고침 시
$(document).ready(function(){
    //초기 (유저 인증도 한다는 가정하에) 세션 url 및 유저의 채널 목록 API 요청
    //session url, channel list music server api call
    $.ajax({
        url: //url,channel API url
        data: //userId
        ...
        //api response success
        success: function(data) {
            var url = data.url;//session url
            channels = data.channels;// user's channel list

            //session socket connect
            socket = io.connect(url, socketOption);
        },
    });
})

//다른 유저 채널 구독 시
$('form#subscribe').submit(function(){
    var otherId = $('#subId').val();

    subscribe(subId);

    $('subId').val('');
    return false;
});

//채널 구독 취소 시
$('form#unsubscribe').submit(function(){
    var otherId = $('#unsubId').val();

    unsubscribe(unsubId);

    $('unsubId').val('');
    return false;
});

//곡 수정 시
$('form#modify').submit(function(){
    //곡 수정 API에 필요한 param값 정리 한 후 요청
    var modifyParam = {
        userId = ..
        channelId = ..
        changeParam = ..
    };
    modifyPlaylist(modifyParam);
});

//세션 소켓 연결 요청에 대한 응답왔을 때
socket.on('connect', function(data){
    //socket connect complete, and then channel subscribe
    socket.emit("nchat-xxx", {
        command: subscribe,
        channels: channels
    });
});

//세션 채널 구독 요청에 대한 응답왔을 때
socket.on('nchat-xxx', function(data){
    //channel subscribe connect complete, and then get playlist of channels
    if(!oldChannel.isEmpty()){
        //update totalPlaylist variable
        delete totalPlaylist[oldChannel];
        //unshown oldChannel's playlist
        ...
        ...
        //initialize oldChannel
        oldChannel = [];
    }
    else if(!newChannel.isEmpty()){
        //get only new channel's playlist, because other playlist is already shown
        getPlaylist(newChannel);
    }
    else{
        //get all playlist
        getPlaylist(channels);
    }
});

//해당 채널 이벤트 발생 시 emit된 메시지 왔을 때
socket.on('send', function(data){
    var targetChannel = data.channel;
    var changeParam = data.changeParam;

    //targetChannel 재생목록을 changeParam을 토대로 뷰 수정
});

//해당 채널에 대한 재생목록 API 요청(받아와서 뷰에 뿌려주는 것 까지)
function getPlaylist(channels){
    $.ajax({
        url: //getPlaylist API url
        data: //channels
        ...
        //api response success
        success: function(data) {
            var playlists = data.playlists;//{channel1: playlist1, channel2: playlist2 ...}의 json형태

            //update totalPlaylist variable
            for(channel in playlists){
                totalPlaylist.channel = playlist[channel];
            }

            //view playlists on screen
            ....
            ...
            //newChannel initialize
            newChannel = [];
        },
    });
}

//새로운 채널 구독 시 (채널 목록 업데이트 하고 새로 받은 url로 세션 소켓 다시 연결)
function subscribe(otherId){
    $.ajax({
        url: //subscribe other's channel API url
        data: //userId, otherId
        ...
        //api response success
        success: function(data) {
            var url = data.url;
            newChannel = data.channel;
            channels.push(newChannel);
            //session reconnect is nesessary to get new session url that cover new channel added
            socket.emit('disconnect');//새로 연결할 때 disconnect하고 연결해야되는지 그냥 연결 하면 기존연결 끊어지고 새롭게 연결되는지 확인 요망
            socket = io.connect(url, socketOption);
        },
    });
}

function modifyPlaylist(modifyParam){
    $.ajax({
        url: //modify playlist API url
        data: //userId, channelId, changeParam
        ...
        //api response success
        success: function(data) {
            //API가 세션 채널에 이벤트 전송까지 했으므로 세션 서버에서 emit된 메시지를
            //socket.on('send' function)에서 처리
        },
    });
}

function unsubscribe(otherId){
    $.ajax({
        url: //cancel subscription API url
        data: //userId, otherId
        ...
        //api response success
        success: function(data) {
            channels = data.channels;
            oldChannel = data.oldChannel;
            socket.emit("nchat-xxx", {
                command: subscribe,
                channels: channels
            });
        },
    });
}
