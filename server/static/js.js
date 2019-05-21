

var canvas = document.getElementsByTagName('canvas')[1],
    ctx = canvas.getContext('2d'),
    msg = document.getElementById('msg'),
    ranger = document.getElementById('ranger'),
    alter_canvas=true,
    colors = document.getElementById('colors');

var input = document.getElementById('input-msg'),
    users = document.getElementById('div-users'),
    btnIn = document.getElementById('btn-in'),
    btnAutoin = document.getElementById('btn-autoin'),
    info = document.getElementById('info'),
    tops = document.getElementById('tops');

btnIn.inAct = function () {
    this.innerText='下场';
    this.in=true;
};
btnIn.outAct = function () {
    this.innerText='上场';
    this.in=false;
    this.disabled = false;
};
var isBusy = 0;
tops.template = tops.querySelector('[role=template]').cloneNode(true);

info.time = info.querySelector('#time')
info.player = info.querySelector('#player')
info.word = info.querySelector('#word')
btnAutoin.addEventListener('click',function (e) {
    var btnin = btnIn;
    if(btnin.autoIn == null){
        // btnin.outAct();
        if(!btnin.in) socket.emit('in');
        btnin.autoIn = setInterval(function () {
            if(canvas.isMe) return;
            if(!btnin.in) socket.emit('in');
        },5000);
    }else{
        clearInterval(btnin.autoIn);
        delete btnin.autoIn;
    }
    this.classList.toggle('on');
});
btnIn.addEventListener('click',function () {
    var t = this.in;
    if(this.t) clearTimeout(this.t);
    this.t = setTimeout(function () {
        socket.emit(!t?'in':'out');
    },400);
})

window.onload = function () {
    Ctl.init();
    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.paths = canvas.pts = [];
        socket.emit('repaint');
    }
    this.addEventListener('resize',resize);
    resize();
    input.onkeydown = function (e) {
        if(e.keyCode === 13 && this.value!=''){
            if(canvas.isMe){
                alert('绘图者不能够发送消息！');
                return;
            }
            socket.emit('client msg',this.value);
            socket.emit("barrage", this.value);
            this.value = '';
        }
    }
    document.querySelector('#btns').addEventListener('click',function (e) {
        if(e.target.classList.contains('btn-active-able')){
            if(this.prevBtn){
                this.prevBtn.classList.remove('active')
            }
            e.target.classList.add('active')
            this.prevBtn = e.target;
        }
    },true);
}


colors.addEventListener('click',function (e) {
    var t = e.target;
    if(t.classList.contains('rect')){
        Array.prototype.slice.call(this.getElementsByClassName('active'))
            .forEach(v=>v.classList.remove('active'));
        t.classList.add('active');
        Ctl.setColor(t.style.backgroundColor);
    }
});
ranger.addEventListener('change',function (e) {
    this.nextElementSibling.innerText = this.value;
    Ctl.setLw(this.value);
});

Ctl = {
    drawPts: function (ctx,pts) {
        if(pts instanceof Path || pts.pts){
            var color = pts.color,lw = pts.lw;
            pts = pts.pts;
        }
        var p1 = pts[0];
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        pts.slice(1).forEach(v=>{
            ctx.lineTo(v.x,v.y);
        });
        ctx.lineWidth = lw || canvas.lw
        ctx.strokeStyle = color || canvas.color;
        ctx.stroke();
        ctx.restore();
    },
    drawTool:function(tool_num,sX,sY,eX,eY)
    {
        startX=sX;
        startY=sY;
        endX=eX;
        endY=eY;
        print(ctx,tool_num)
    },
    init : function () {
        canvas.paths=[];
        canvas.pts=[];
        canvas.color = 'black';
        canvas.lw = 1;
        for(var i=0;i<20;i++)
            this.addColor();
    },
    setLw(lw){
        canvas.lw = lw;
    },
    setColor(c){
        canvas.color = c;
    },
    addPath : function (pts) {
        canvas.paths.push(new Path(pts,canvas.lw,canvas.color));
    },
    addPos : function (x,y) {
        canvas.pts.push(new Pos(x,y));
    },
    clearPos : function () {
        canvas.pts = []
    },
    addColor : function (active) {
        var rect = document.createElement('div'),r = this.random;
        rect.className = 'rect';
        if(active)
            rect.className+=' active';
        rect.style.backgroundColor = 'rgb('+[r(256),r(256),r(256)].join(',')+')';
        colors.appendChild(rect);
    },
    random : function (b) {
        return Math.floor(Math.random()*b);
    }
};

function bf() {
    var audio = document.getElementById('music1');
    audio.volume = 0.5;
    if (audio !== null) {
        timedMsg();
        audio.currentTime = 0.0;
        audio.play();

    }
}
function timedMsg() {
    setTimeout(set,500);
}
function set() {
    isBusy = 1;
}


function Pos(x,y) {
    this.x=x;this.y=y;
}

function Path(pts,lw,color) {
    this.pts = pts;
    this.lw = lw || canvas.lw;
    this.color = color || canvas.color;
}

function Rect(x,y,w,h) {
    this.x=x;this.y=y;this.w=w;this.h=h;
}


Rect.prototype.clearOn = function (ctx) {
    ctx.clearRect(this.x,this.y,this.w,this.h);
}


function bg1() {
    document.getElementById("background").style.display="inline";
}

function bg2() {
    document.getElementById("background").style.display="none";
    document.body.style.backgroundImage="url(bg1.jpg)";
}

function bg3() {
    document.getElementById("background").style.display="none";
    document.body.style.backgroundImage="url(bg2.png)";
}

function bg4(){
    document.getElementById("background").style.display="none";
    document.body.style.backgroundImage="url(bg3.jpg)";
}
var startP=true;
var startX;
var startY;
var endX;
var endY;
var assistant_tools;
var c2=document.getElementById("myCanvas2");
var ctx2=c2.getContext("2d");
var map_width=1265;
var map_height=500;
function setAssistantTools(num)
{
    assistant_tools=num;
    alter_canvas=false;
}
function setTure() {
    alter_canvas=true;
}
function print(ctx3,tool) {
    ctx3.beginPath();
    var weight;
    var height;
    switch (tool)
    {
        case 1:
            ctx3.moveTo(startX,startY);
            ctx3.lineTo(endX,endY);
            break;
        case 2:
            ctx3.ellipse(Math.abs(startX+endX)/2,Math.abs(startY+endY)/2,Math.abs(startX-endX)/2,Math.abs(startY-endY)/2,0,0,Math.PI*2);
            break;
        case 3:
            weight=Math.abs(endX-startX);
            height=Math.abs(endY-startY);
            if(startX<endX)
            {
                endX=startX;
            }
            if(startY<endY)
            {
                endY=startY;
            }
            ctx3.beginPath();
            ctx3.fillRect(endX,endY,weight,height);
            ctx3.clearRect(endX+2,endY+2,weight-4,height-4);
            break;
    }
    ctx3.stroke();
}

canvas.addEventListener('mousemove',function (e) {
    var w=20,h=20;
    if(canvas.isMe){
        if(alter_canvas)
        {
            var x = e.offsetX, y = e.offsetY;
            if(e.buttons === 1) {
                if(!this.erase){
                    Ctl.addPos(x,y);
                    Ctl.drawPts(ctx, this.pts);
                    if (isBusy == 1){
                        bf();
                        isBusy = 0;
                    }
                    socket.emit('paint',JSON.stringify({data:new Path(this.pts),status:'ing'}))
                }else{
                    var rect = new Rect(x-(w>>>1),y-(h>>>1),w,h);
                    rect.clearOn(ctx);
                    socket.emit('erase',rect.x,rect.y,rect.w,rect.h);
                }
            }
        }
        else
        {
            var w=20,h=20;
            var x = e.offsetX, y = e.offsetY;
            endX=x;
            endY=y;
            var width;
            var height;
            if(startP) {
                ctx2.clearRect(0,0,map_width,map_height);
                width=Math.abs(x-startX);
                height=Math.abs(y-startY);
                if(startX<x)
                {
                    x=startX;
                }
                if(startY<y)
                {
                    y=startY;
                }
                ctx2.fillRect(x,y,width,height);
                print(ctx2,assistant_tools);
                for(var i=0;i<map_width;i+=2)
                {
                    ctx2.clearRect(i,0,1,map_height);
                }
                for(var i=0;i<map_height;i+=2)
                {
                    ctx2.clearRect(0,i,map_width,1);
                }
                ctx2.stroke();
            }
        }
    }
});

canvas.addEventListener('mouseup',function (e) {
    if(!canvas.isMe ) return;
    if(alter_canvas)
    {
        var x = e.offsetX,y = e.offsetY;
        Ctl.addPos(x,y);
        Ctl.addPath(this.pts);
        audio.pause();
        isBusy = 0;
        socket.emit('paint',JSON.stringify({data:new Path(this.pts),status:'end'}));
        Ctl.clearPos();
    }
    else
    {

        var x = e.offsetX, y = e.offsetY;
        endX = x;
        endY = y;
        startP = false;
        ctx2.clearRect(0, 0, map_width,map_height);
        ctx2.stroke();
        print(ctx,assistant_tools);
        ctx.stroke();
        socket.emit('paint tool',assistant_tools,startX,startY,endX,endY);
        alter_canvas=true;
    }
})

canvas.addEventListener('mousedown',function (e) {
    if(!this.isMe) return;
    if(alter_canvas)
    {
        if(this.erase){
            var w=20,h=20;
            var rect = new Rect(x-(w>>>1),y-(h>>>1),w,h);
            rect.clearOn(ctx);
            socket.emit('erase',rect.x,rect.y,rect.w,rect.h);
            return;
        }
        var x = e.offsetX,y = e.offsetY;
        isBusy = 1;
        Ctl.clearPos();
        Ctl.addPos(x,y);
    }
    else
    {
        var x = e.offsetX, y = e.offsetY;
        startP = true;
        startX = x;
        startY = y;

    }
});

function clearAll() {
    ctx2.beginPath();
    ctx2.clearRect(0, 0, map_width,map_height);
    ctx2.stroke();
}
