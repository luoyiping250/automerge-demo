let socket = new WebSocket("ws://xxx/websocket/" + Math.random().toString());

socket.onopen = function(){
  console.log("websocket已连接");
};

socket.onclose = function(){ 
  console.log("websocket已关闭"); 
};

socket.onerror = function(error){ 
  console.log("websocket错误：" + error); 
};

export default socket;