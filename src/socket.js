let socket = new WebSocket("ws://192.168.153.143:8080/websocket/" + Math.random().toString());

socket.onopen = function()
{
  // Web Socket 已连接上，使用 send() 方法发送数据
  socket.send("发送数据");
  console.log("数据发送中...");
};

socket.onmessage = function (evt) 
{ 
  console.log("数据已接收...");
};

socket.onclose = function()
{ 
  // 关闭 websocket
  console.log("连接已关闭..."); 
};

export default socket;