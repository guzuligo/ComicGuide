
(window.ComicGuide=window.ComicGuide||{}).builder =
class ComicBuilder{
    constructor(){
        this.comic={
            canvas:null,
            manager:null,
            interface:null,
            frame:null,
            container:null,
        };
        
        this.config={
            comic:"comic",canvas:"comic",
            frame:"frame",
            container:"",
            width:740,
            height:360,
            buttons:{},

            setup:{
                folder:"./",
                images:[],pages:[],
                css:{animations:[],styles:[]},
            }
        }

        this._createDefaultButtons();
        
    }

    init(force_use_config=false){
        //
        var F=force_use_config;
        var c,elm,d,dd;
        c=this.comic;
        dd=(sss)=>document.getElementById(sss);
        d=this.config;
        elm=dd(d.canvas||d.comic);
        //
        if(F||!c.canvas)//Forced or lacking canvas? set it:
            c.canvas=new ComicGuide.canvas(elm,d.width,d.height);
        if(F||!c.manager)
            c.manager=new ComicGuide.manager(c.canvas);
        if(F||!c.interface)
            c.interface=new ComicGuide.interface(c.manager);
        if (c.frame||d.frame)//do we have a frame somewhere?
            c.canvas.body=c.frame=(F||!c.frame)?dd(d.frame):c.frame;//use it
        //If container config available, use it the same as above
        //otherwise, use html (or default)
        if(d.container &&(F||!c.container)){
            c.container=dd(d.container);
            c.container.onmouseup=()=>{this.comic.canvas.resize();}
            c.container.style.backgroundImage="repeating-linear-gradient(-45deg,"
            +"#777899 0%,#777888 1%, #555666 1%, #555666 2%,#777899 2%"
            +")"
        }

        c.manager.load(d.setup);
        return this;
    }

    resize (width=0,height=0){
        //BUG: height is not increasing properly
        if(width)   this.comic.canvas.width=width
        if(height)  this.comic.canvas.height=height
        this.comic.interface._getStyleFormat(true);
        this.comic.canvas.resize()._makeMainStyle(true);
    }

    reset(){
        //TODO: probably needed config as well
        this.resize(this.config.width,this.config.height);
        this.comic.manager.load(this.config.setup);
        return this;
    }

    _createButtons(config={}){
        var c,b=[];
        c=document.getElementById(config.parent||"configure");
        c   .appendChild(b[0]=document.createElement("div"))
        b[0].appendChild(b[1]=document.createElement("div"))
        b[0].appendChild(b[2]=document.createElement("input"))
        b[0].appendChild(b[3]=document.createElement("button"))
        b[0].appendChild(b[4]=document.createElement("button"))
        b[0].className="floater"
        b[1].innerHTML=config.name || "TEST";
        b[2].value=config.default || 0;
        b[3].innerHTML=config.left||"⏮️"
        b[4].innerHTML=config.right||"⏭️"

        b[2].onchange=()=>(config.onchange||console.log)(b);
        b[3].onclick=config.onleftclick  || ((e)=>{b[2].value--;b[2].onchange(b)})
        b[4].onclick=config.onrightclick || ((e)=>{b[2].value++;b[2].onchange(b)})
        this.config.buttons[b[1].innerHTML.toLowerCase()]=b;
    }

    _createDefaultButtons(){
        this._createButtons({
            name:"Page", parent:"configure",
            onchange:(b)=>{
                var v=Number(b[2].value||0);
                b[2].value=v<0?0:Math.min(v,this.config.setup.pages.length);
            }
        });
        this._createButtons({
            name:"Layer",parent:"configure",
            onchange:(b)=>{
                var v=Number(b[2].value||0);
                var p=Number(this.config.buttons["page"].innerHTML)||0
                //var x=this.config.setup.pages[p];
                //x=x?x.layers.length:0
                b[2].value=v<0?0:v;//Math.min(v,x);
            }
        });
        this._createButtons({
            name:"Object",parent:"configure",
            onchange:(b)=>{
                var v=Number(b[2].value||0);
                var p=Number(this.config.buttons["page"].innerHTML)||0
                var L=Number(this.config.buttons["layer"].innerHTML)||0
                //var x=this.config.setup.pages[p];
                //if(x)x=x.layers[L];
                //x=x?x.length:0;
                b[2].value=v<0?0:v;//Math.min(v,x);
            }
        });
    }

}