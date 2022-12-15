
(window.ComicGuide=window.ComicGuide||{}).builder =
class ComicBuilder{
    constructor(){
        this.comic={
            canvas:null,
            manager:null,
            interface:null,
            frame:null,
            container:null,
            ui:{},
        };
        
        this.config={
            comic:"comic",canvas:"comic",
            frame:"frame",
            container:"",
            width:740,
            height:360,
            

            setup:{
                folder:"./",
                images:[],pages:[],
                css:{animations:[],styles:[]},
            }
        }

        this._createDefaultButtons();
        
    }


    init(force_use_config=false){
        
        var dd=(sss)=>this._getElement(sss);//shorthand
        //
        var F=force_use_config;
        var c,elm,d;
        
        c=this.comic;
        
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

    reset(gotoPage=-1){
        //TODO: probably needed config as well
        this.resize(this.config.width,this.config.height);
        var a=this.comic.manager.load(this.config.setup);
        if (gotoPage>-1){
            var i=this.comic.interface.input.node;
            i.value=gotoPage;
            i.oninput();i.onchange();

        }
        return this;
    }

    _populateObject(){
        var ui=this.comic.ui
        //this.comic.ui[""]
        var p=Number(ui["page"][2].value);
        var l=Number(ui["layer"][2].value);
        var o=Number(ui["object"][2].value);
        //
        //console.log(p,l,o)
        try{
            o=this.config.setup.pages[p].layers[l][o];
        }catch(_err){
            o={};
        }
        //
        if (Object.keys(o).length==0){
            ui["file"].value="";
            ui["parent"][2].value=0;
            ui["type"].selectedIndex=0
            return this;
        }


        ui["file"].value=o.node.charAt(0)=="."?"":o.node;
        ui["parent"][2].value=o.parent;

        ui["type"].selectedIndex=(()=>{
            var name="";
            if(o.node==".div")
                name="Group"
            else
                name="File"
            var to=this._optionToNumber(ui["type"],name);
            console.log(to)
            return  to;
        })();
            
        return this;
    }

    _optionToNumber(options,name){

        for (var i=0;i<options.children.length;i++)
            if(options.children[i].innerHTML==name)
                return i;
        return -1;
    }
    _createInput(config){
        var c,div,input,i,b=[];
        c=this._getElement(config.parent||"configure");
        c   .appendChild(div    =document.createElement("div"));

        div.innerHTML="<div><div >"
        +config.name+":</div></div>  ";
        div.className="floater"
        div .appendChild(input =document.createElement("input"));
        input.className='floater'
        if(config.id)
            input.id=config.id
        var style="";
        if(config.width)
            style+="width:"+config.width+";";

        if (style)
            input.style=style;
        
        input.onchange=config.onchange||((e)=>console.log("Selection Changed:",input.value));
        this.comic.ui[config.name.toLowerCase()]=input;
    }
    _createSelection(config={}){
        var c,div,select,i,b=[],style="";
        var B=(b)=>b[b.length-1];//shorthand
        c=this._getElement(config.parent||"configure");
        c   .appendChild(div    =document.createElement("div"));
        div.className="floater";
        b.push(this._createDiv({
            parent:div,
            innerHTML:config.name+"<br>",
        },true));

        //div.innerHTML="<div>"//<div style='padding-top:50%;margin-bottom:50%'>"
        //              +config.name+":</div>"//</div>  "
        
        B(b).appendChild(select =document.createElement("select"));
        if(config.id)
            select.id=config.id
        
        var I=b.length;
        for (i=I;i<I+config.options.length;i++){
            select.appendChild(b[i]=document.createElement("option"))
            
            b[i].innerHTML=config.options[i-I];
        }
        if(config.id)
            select.id=config.id
        if (config.size){
            select.size=config.size;
            style+="height:"+(Number(config.size))+"em;";
        }
        if (config.width)
            style+="width:"+config.width+";";

        select.style=style;
        select.onchange=config.onchange||((e)=>console.log("Selection Changed:",select.value));
        this.comic.ui[config.name.toLowerCase()]=select;
        return this;
    }
    _createButtons(config={}){
        var c,b=[];
        c=this._getElement(config.parent||"configure");
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
        this.comic.ui[b[1].innerHTML.toLowerCase()]=b;
        if(config.id)
            b[2].id=config.id
        return this;
    }
    _createDiv(config={},returnDiv=false){
        var c,div,i,b=[],style="";
        c=this._getElement(config.parent||"configure");
        c   .appendChild(div    =document.createElement("div"));
        if (config.id)
            div.id=config.id;
        if (config.innerHTML)
            div.innerHTML=config.innerHTML;
        if (config.className)
            div.className=config.className;
        if(config.height)
            style+="height:"+config.height+";";
        if(config.style)
            style+=config.style;
        //style+="padding-bottom:115px;"
        div.style=style;
        return (returnDiv)?div:this;
    }
    _getElement(id){
        if (typeof(id)=="string")
            return document.getElementById(id);
        else
            return id;
    }

    _quickApplyObjectSettings(){
        this.applyObjectSettings()
        this.reset(this.comic.ui["page"][2].value)
    }


    _createDefaultButtons(){
        //page menu
        this._createButtons({
            name:"Page", parent:"configure",
            onchange:(b)=>{
                //limit to page length
                var v=Number(b[2].value||0);
                b[2].value=v<0?0:Math.min(v,this.config.setup.pages.length);
                this._populateObject().reset(b[2].value);
            }
        });
        this._createButtons({
            name:"Layer",parent:"configure",
            onchange:(b)=>{
                var v=Number(b[2].value||0);
                var p=Number(this.comic.ui["page"].innerHTML)||0
                //var x=this.config.setup.pages[p];
                //x=x?x.layers.length:0
                b[2].value=v<0?0:v;//Math.min(v,x);
                this._populateObject();
            }
        });
        this._createButtons({
            name:"Object",parent:"configure",
            onchange:(b)=>{
                var v=Number(b[2].value||0);
                var p=Number(this.comic.ui["page"].innerHTML)||0
                var L=Number(this.comic.ui["layer"].innerHTML)||0
                //var x=this.config.setup.pages[p];
                //if(x)x=x.layers[L];
                //x=x?x.length:0;
                b[2].value=v<0?0:v;//Math.min(v,x);
                this._populateObject();
            }
        });


        //object menu
        this._createDiv({
            parent:"objects",
            id:"object main",
            style:"float:none;margin-bottom:10px;height:max-content;"
            //className:"floater"
        });
        
        this._createSelection({
            onchange:()=>this._quickApplyObjectSettings(),
            parent:"object main",
            name:"Type",
            id:"object_type",
            width:"98px",
            options:["Deleted","File","Group"]
        });

        this._createInput({
            onchange:()=>this._quickApplyObjectSettings(),
            parent:"object main",
            name:"File",width:"15ch"
        });
        this._createButtons({
            name:"Parent", parent:"object main",
            onchange:(b)=>{
                var v=Number(b[2].value||0);
                b[2].value=v<0?0:v;//Math.min(v,this.config.setup.pages.length);
            }
        });

        //object setup menu
        this._createDiv({
            parent:"objects",
            id:"object setup",
            style:"clear:left;padding-top:20px;margin-top:20px;",
        });

        this._createSelection({
            parent:"object setup",
            name:"Styles",
            id:"object_type",
            width:"7em",size:6,
            
            options:[]
        });
        return this;
    }

    applyObjectSettings(){
        var ui=this.comic.ui;
        var choice=ui["type"].value.toLowerCase();

        //on delete, just make sure it does not exists
        if (choice=='deleted'){
            this._deleteObject(
                Number(ui["page"][2].value),
                Number(ui["layer"][2].value),
                Number(ui["object"][2].value),
            );
            console.log("DELETED")
            return this;
        }


        var obj=this._secureObject(
            Number(ui["page"][2].value),
            Number(ui["layer"][2].value),
            Number(ui["object"][2].value),
        );
        
        obj.parent=Number(ui['parent'][2].value)
        switch(choice){
            case 'file':
            //case 'audio':
                obj.node=ui['file'].value.trim();
                break;
            case 'group':
                obj.node='.div'
                break;
        }
        return this;
    }

    _deleteObject(page,layer,index){
        var setup=this.config.setup;
        //don't bother if not exists
        if (!setup.pages[page] || !setup.pages[page].layers[layer] ||
            setup.pages[page].layers[layer].length<=index)
            return this;
        var L=setup.pages[page].layers[layer];
        L[index]={};//make empty

        //delete all empty objects in the layer
        while(Object.keys(L[L.length-1])==0)
            L.pop();
        //delete all layers with only their empty settings
        L=setup.pages[page].layers;
        while(L.length>0 && Object.keys(L[L.length-1])<2)
            L.pop();
        return this;
    }



    _secureObject(page,layer,index){
        console.log (page,layer,index)
        var setup=this.config.setup;
        //Secure the page
        while(setup.pages.length<=page)//TODO: max page count setup
            setup.pages.push({
                //add new page until there is enough
                exceptions:[],
                layers:[],
            });

        var _page=setup.pages[page];

        //secure the layer
        while (_page.layers.length<=layer)
            _page.layers.push([{node:null}]);//first node is layer setup

        //secure the object
        var _layer=_page.layers[layer];
        while(_layer.length<=index)
            _layer.push({});
        
        return setup.pages[page].layers[layer][index];

    }



    saveConfig(){
        var name_="comicConfig.json";
        var file = new File([JSON.stringify(this.config)],name_, {
            type: "text/plain",
        });
        var a=document.createElement("a");
        a.href= URL.createObjectURL(file);
        a.download = name_;
        a.click();
    }

    loadConfig(data){
        this.config= JSON.parse(data);
        this.reset(0);
        this._populateObject();
    }

}