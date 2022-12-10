
(window.ComicGuide=window.ComicGuide||{}).interface =
class ComicInterface{
    constructor(manager){
        this.manager=manager;
        manager.interface=this;
        this.hidden=false;
        this.height=64;//slider height (Will autoset)
        this.input=null;
        this.step=64;//(markers placement)
        this.length=100;
        this._style=null;//style html element
        //tmp
        //this._initInterface();
        
    }
    reset(){

        //TODO:start with clean up
        var M=this.manager;
        var L=M.interfaceLayer;
        this.length=this.manager.jsonComic.pages.length-1;
        //M.comic.node.onclick=console.log
        M.comic.addEventListener(M.comic.node,"click",(e)=>this._onclick(e));
        this._initInterface();
    }

    _getStyleFormat(resetStyle=false){
        var c_bg="#777788"
        var c=".ComicMainDiv"+this.manager.comic.styleTag+" ";
        var h=this.manager.comic.height;
        var w=this.manager.comic.width;
        var p=this.height=Math.floor(this.barHeight=(h<w?h:w)*0.1);
        var width=w-p*6;
        var s=this.step=1/(this.length)*(100-100*p/width);
        var hh=this.manager.comic.height-p-p*.25;
        //console.log("height should be:"+p)
        var t=""
        +c+".slidecontainer {width: 10%;top:"+hh+"px;left:0px;}\n"


        +c+".slider {appearance:none;\n"
        +"width: "+(width)+"px;height: "+p+"px;position:absolute;left:"+(p*2)+"px;"//"top:"+(this.manager.comic.height-p-p*.25)+"px;"
        +"background: #ddddee;background-image: repeating-linear-gradient(to right,"
        +"#777888 0%,#777888 1%,#aaaabb 1%,"
        +"#aaaabb "+(s)+"%"
        +");\n"
        +"opacity: 0.4;transition: opacity .5s;\n"
        +"}\n"


        +c+".slider:hover {opacity: 1;}\n"


        +c+".slider::-moz-range-thumb {\n"
        +"width: "+p+"px;height: "+p+"px;\n"
        +"background: #808090;cursor: pointer;\n"
        +"}\n"


        +c  +".pagecounter {font-family:Papyrus;background-color:"+c_bg+";opacity:0.5;"
            +"left:"+(p*0.3)+"px;top:"+(p*0.3)+"px;position:relative;"
            +"width:"+(p*1.3)+"px;height:"+(p*0.65)+"px;}"

        if (resetStyle)this._style.innerHTML=t;
        
        return t;
    }

    _initInterface(){
        var r=this.manager.comic.document;
        var tag=this.manager.comic.styleTag;

        //
        var st;
        st=this._style=r.createElement('style');
        st.type = 'text/css';
        st.innerHTML=this._getStyleFormat();
        r.getElementsByTagName('head')[0].appendChild(st);
        //
        
        var ii=this.manager.interfaceLayer;
        var SS=ii.add('.div');
        var ss=this.input=SS.add('.input');
        ii.removeClasses("ComicNoMove"+tag)
        //ii.node.appendChild(ss);
        SS.removeClasses("ComicNoMove"+tag).addClasses("slidecontainer"+tag);
        ss.addClasses("slider").removeClasses(["ComicNoMove"+tag,"cNodeDefault"+tag]);//.addClasses("cNodeDefault");

        //ss.class="slider";
        ss=ss.node;
        ss.type="range";
        ss.min=ss.value=0;
        ss.max=this.manager.jsonComic.pages.length-1;
        //ss.step=5;
        //Modify page based on selection
        ss.onchange=()=>this.manager.goto(Number(ss.value));
        
        //temporarily
        //ss.style.width="100%";
        //ss.style.appearance="none";
        ss.style.borderRadius="16px"
        //ss.style.height=this.barHeight+"px";


        //PAGE NUMBER
        var pp=SS.add('.div').removeClasses("cNodeDefault"+tag).addClasses(["ComicNoSelect"+tag,"pagecounter"]);
        var tt;
        tt=pp.node.style;
        //pp.position="absolute"
        //tt.top=this.height//-this.barHeight*0.5;
        pp.node.innerHTML="00/00"
        pp.node.style.scale=(this.height/25);
        ss.oninput=()=>pp.node.innerHTML=ss.value+"/"+ss.max;
        ss.oninput();

        
        window.ss=ss;//DEBUG

        //add style
        
        ii.node.id="test"
    }

    _onclick(e){window.eee=e;
        //only works on comic node
        if (e.target!=this.manager.comic.node)
            return ;//console.log(e);
        
        var h=e.layerY>this.manager.comic.height-this.height*2;
        console.log(e,"\nhidden",this.hidden)
        if(this.hidden){
            if (h){
                this.input.node.value=this.manager.pageNumber;
                this.manager.interfaceLayer.node.style.visibility="visible";
                this.hidden=!this.hidden;
            }
            else
                if (e.layerX/this.manager.comic.width>=.7)
                    this.manager.next();
                if (e.layerX/this.manager.comic.width<=.3)
                    this.manager.prev();
        }else
            if(!h){
                this.manager.interfaceLayer.node.style.visibility="hidden";
                this.hidden=!this.hidden;
            }
        //console.log("Interface event",e,comic.width)
        console.log("to",this.hidden)
    }
}