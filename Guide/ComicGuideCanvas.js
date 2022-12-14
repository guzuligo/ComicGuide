
//configure
//this.body to use the main html for resizing
//this.margin to add a margin to resizing

(window.ComicGuide=window.ComicGuide||{}).canvas =
class ComicCanvas{
    constructor(div,width=740,height=360,maxScale=1,styleTag=""){
        this.node=div;
        this.document=div.getRootNode(); 
        this.width=width;
        this.height=height;
        this.body=this.document.getElementsByTagName("html")[0]//div.parentElement.parentElement.parentElement;
        this.images={};
        this.added={};
        this._newid=0;
        this.margin=[0,0]
        this.styleTag=styleTag;
        this._cssStyles=null;
        this.animations={};
        this.styles={};
        this.maxScale=maxScale;
        this.events=[];
        this.addingTag="";//current tagging for any added element
        this.manager=null;//ComicGuide manager

        this._autoRefresh=true;//trigger refresh events instead of waiting for a call
        this.folder="./";//last folder used
        this.allowActions=true;//allow animations and functions

        //Keep size consistant
        //window.addEventListener("resize",()=>{this.resize.call(this);});
        this._initEvents();

        //initialize styles
        this._initStyles()._initDefaultStyles();


        this.resize();
    }

    _initEvents(){
        this.events=[
            [window,"resize",()=>{this.resize.call(this);}]
        ];
        var e=this.events;
        for (var i=0;i<e.length;i++)
            e[i][0].addEventListener(e[i][1],e[i][2]);
    }

    _clearEvents(){
        var e=this.events;
        for (var i=0;i<e.length;i++)
            e[i][0].removeEventListener(e[i][1],e[i][2]);
    }

    addEventListener(target_,event_,function_){
        this.events.push([target_,event_,function_]);
        target_.addEventListener(event_,function_);
    }

    removeEventListener(target_,event_,function_=null){
        var e=this.events;
        this.events=[];
        var toadd;
        for (var i=0;i<e.length;i++){
            toadd=true;
            if (e[i][0]==target_)
                if(!event_ || e[i][1]==event_)
                    if(!function_ || e[i][2]==function_){
                        toadd=false;//removing required
                        e[i][0].removeEventListener(e[i][1],e[i][2]);
                    }
            if (toadd)//If removing not required, add it
                    this.events.push([e[i][0],e[i][1],e[i][2]])
        }
    }

    hasListener(target_,event_,function_){
        var e=this.events;
        for (var i=0;i<e.length;i++){
            if (e[i][0]==target_)
                if(!event_ || e[i][1]==event_)
                    if(!function_ || e[i][2]==function_){
                        return true
                    }
        }
        return false;
    }




    //fix comic dimensions
    _initStyles(){
        //style
        var tag=this.styleTag;//=tag;
        var s=this._makeMainStyle();
        var r=this.document;
        var st;
        st=r.createElement('style');st.type = 'text/css';
        st.innerHTML=s;
        r.getElementsByTagName('head')[0].appendChild(st);
        this.mainStyle=st;

        this.node.className="ComicMainDiv"+tag;//+" ComicNoSelect"+tag;
        this.node.parentElement.className="ComicSuperDiv"+tag;
        this.node.parentElement.parentElement.className="Comic0Margin"+tag;



        st=r.createElement('style');st.type = 'text/css';
        r.getElementsByTagName('head')[0].appendChild(st);
        this._cssStyles=st;

        this._debug()
        return this;
    }

    //onclick tests
    _debug(){
        //this.node.onclick=(a)=>console.log(a)
    }

    //useful to reset style by using this.mainStyle
    _makeMainStyle(doAssignment=false){
        var tag=this.styleTag;
        var s=".ComicMainDiv"+tag+"{\n\ttransform-origin: top left;left:0px;top:0px;overflow:hidden;\n"
        +"margin-right: auto;margin-left: 0px;\n"//+"position:static;\n"
        +"margin-bottom: auto;margin-top: 0px;\n"//+"position:static;\n"
        +"\twidth:"+this.width+"px;\n"
        +"\theight:"+this.height+"px;\n"
        //+"\tmax-height:"+this.height+"px;"
        +"background-color: #443344;}\n";

        s+="\n.ComicSuperDiv"+tag+"{\n\toverflow:hidden;\n"
        //+"\tmax-width:"+this.width+"px;\n"
        +"\theight:"+this.height+"px;\n"
        +"background-color: red;}\n";

        s+=".ComicNoMove"+tag+"{pointer-events: none;}\n"
        +".ComicNoSelect"+tag+"{user-select: none;user-drag:none;}\n"; 

        s+=".Comic0Margin"+tag+"{\n\tmargin-top: 0px;margin-bottom: 0px;"
          +"margin-right: 0px;margin-left: 0px;\n"
          +"}\n";

        s+=".cNodeDefault"+tag+"{\n\tposition:absolute;left:0px;top:0px\n}\n";

        if (doAssignment)
            this.mainStyle.innerHTML=s;
        return s;
    }


    resize(){
        var w=this.width;
        var h=this.height;
        var spr=this.node.parentElement;
        var div=this.node;
        var r= spr.getBoundingClientRect()
        var pp=this.body;//spr.parentElement.parentElement;
        var b=[pp.clientWidth-this.margin[0],pp.clientHeight-this.margin[1]];
        if (b[0]/b[1]<w/h){
            b=[w,b[0]]
        }
        else{
            b=[h,b[1]]
        }
        var s=Math.min(b[0]*this.maxScale,b[1]) /b[0];
        div.style.transform="scale("+(s*100)+"%)";
        spr.style.width=(s*w)+"px";
        spr.style.height=(s*h)+"px";
        //console.log("Resize to spr " + r.right+", div " + spr.clientWidth)
        //console.log(b)
        return this;
    }

    resize_testVersion(){
        var w=this.width;
        var h=this.height;console.log(this,"oo",h)
        var spr=this.node.parentElement;
        var div=this.node;
        var r= spr.getBoundingClientRect()
        var pp=this.body;//spr.parentElement.parentElement;
        var b=[pp.clientWidth-this.margin[0],pp.clientHeight-this.margin[1]];console.log(b)
        if (b[0]-w<b[1]-h){
            b=[w,b[0]]
        }
        else{
            b=[h,b[1]]
        }
        var s=Math.min(b[0]*this.maxScale,b[1]) /b[0];
        
        div.style.transform="scale("+(s*100)+"%)";
        spr.style.width=w+"px";//(s*w)+"px";
        spr.style.height=h+"px";//(s*h)+"px";
        
        //console.log("Resize to spr " + r.right+", div " + spr.clientWidth)
        //console.log(b)
        return this;
    }


    _cacheHelper_extensionType(filename){
        var ex=filename.substr(1+filename.indexOf("."));
        //console.log("Extension:",ex)
        if (" mp3 wav ogg".indexOf(ex)>-1){
            return "audio";
        }
        if (" gif jpg jpeg png apng avif webp".indexOf(ex)>-1)
            return "image";
    }
    _cacheHelper_fileType(filename){
        //console.log("FILE",filename)
        var ex=this._cacheHelper_extensionType(filename);
        //console.log("Extension:",ex)
        if (ex=="audio"){
            var a=new Audio();
            return a;
        }
        if (ex=="image")
            return new Image();
        console.warn("File Not Supported", filename)
    }
    cacheImages(filenames=[],folder="./"){
        console.log("Caching Images")
        //this.image={};
        this.folder=folder=folder.trim();
        if (folder[folder.length-1]!="/")
            folder=folder+"/"
        var ttt=1
        for (var i in filenames){
            
            //don't cache file with same name
            if (this.image[filenames[i]])
                continue;
            //create image node and cache it

            var m=this._cacheHelper_fileType(filenames[i]);
            if(true){
                /*
                TODO: caching mechanizim to progressively cache and reload on error
                Nice trick to use: https://instructobit.com/tutorial/119/Force-an-image-to-reload-and-refresh-using-Javascript
                */
               ttt++;
                m.onload=(e)=>{
                    console.log("loaded",m.src,"ttt",ttt,e)
                    //m.onerror=m.onload=m.onloadend=null;
                }
                m.onerror=(e)=>{
                    console.warn("error loading",m.src,"ttt",ttt)
                    m.onerror=m.onload=null;
                }
            }
            m.src=folder+filenames[i];//TODO: on load
            //m.className="ComicNoMove"+this.styleTag;
            //console.log("Work?",filenames[i],m)
            this.image[filenames[i]]=m;
        }
        return this;
    }

    //empty images. does this actually clear memory?
    clearCachedImages(){
        var a=this.image;
        for (var i in a){
            delete a[i]
            //console.log("deleted: "+i)
        }
        this.image={};
        return this;
    }
    //tag null removes all
    //tag string removes =tag
    //tag *string removes containing string
    clearPage(tag=null,exceptionsTag=null){
        //console.log(exceptionsTag)
        for (var i in this.added){
            var t=this.added[i].tag;
            if(tag == null || (tag[0]!="*"?(t==tag):t.indexOf(tag.substr(1))>-1))
                if(exceptionsTag==null || !this.__inString(t,exceptionsTag))
                { 
                    //console.log(tag,exceptionsTag,this.__inString(t,exceptionsTag),this.added[i])                     
                    this.added[i].remove();
                    delete this.added[i];
                }
        }
        if (tag==null && exceptionsTag==null)            
            this._newid=0;

        return this;
    }

    __inString(_string,_stringarray){
        if (_stringarray==null)
            return false;
        for (var i in _stringarray)
            if (_string.indexOf(_stringarray[i])!=-1)
                return true;
        return false;
    }

    getImage(filename){
        if (!this.image[filename]){
            console.log("???",this.image[filename],filename)
            this.cacheImages([filename],this.folder)
        }
        return this.image[filename];
    }

    //image file name stored in the database
    //filename starts with dot for non-image nodes
    add(filename,parent=null){
        var img;

        if (filename[0]!="."){
            if (!this.getImage(filename)){
                console.warn("File %c\""+filename+"\"%cdoes not exists in the cache",'background:#002222');
                return null;
            }
            img=this.getImage(filename).cloneNode();
            if (this._cacheHelper_extensionType(filename)=="audio")
                img.autoplay=true;
            
        }else{//create an object if first is dot
            filename=filename.substr(1);
            img=this.document.createElement(filename);
        }
        parent=parent || this;//.div;
        
        var cNode={
            id:this._newid,
            filename:filename,
            image:img,
            classNames:"",
            transform:{
                position:[0,0],
                rotation:0,
                scale:1,
                skew:[0,0],
            },
            isAdded:false,
            node:null,
            parent:parent,//.comic?parent.node:parent,
            comic:this,
            tag:this.addingTag
        }

        this._addFunctionsToComicNode(cNode);
        //cNode.node=parent.appendChild(img);
        
        //add to inventory
        this.added[this._newid]=cNode;


        this._newid++;
        //add to div

        cNode.add().addClasses("ComicNoMove"+this.styleTag+
        " cNodeDefault" +this.styleTag);
        

        //https://www.w3schools.com/cssref/css3_pr_transform.php
        //cNode.node.style.position="absolute"
        //cNode.node.style.left="0px"
        //cNode.node.style.top="0px"
        return cNode;
    }

    setTag(tag=null){
        this.addingTag=tag;
        return this;
    }


    //add animation to style
    setAnimation(name,value="{}"){
        this.animations[name+this.styleTag]=value;
        if(this._autoRefresh)
            this._refreshStyles()
        return this;
    }

    setStyle(name,value={},comicMainDivChildrenOnly=false){
        this.styles[
            (comicMainDivChildrenOnly?".ComicMainDiv"+this.styleTag+" ":"")+
            name+this.styleTag]
            
            =value;
        if(this._autoRefresh)
            this._refreshStyles()
        return this;
    }

    removeAnimation(name){
        delete this.animations[name+this.styleTag];
        if(this._autoRefresh)
            this._refreshStyles()
        return this;
    }

    removeStyle(name){
        delete this.styles[name+this.styleTag];
        if(this._autoRefresh)
            this._refreshStyles()
        return this;
    }

    //delete all styles and animations
    deleteCss(useRefresh=true){
        this.styles={};
        this.animations={};
        if(this.useRefresh)
            this._refreshStyles()
        return this;
    }

    _refreshStyles(){
        this._cssStyles.innerHTML="";
        var a;
        this._cssStyles.innerHTML+="/*animation keyframes*/\n";
        a=this.animations;for (var i in a)
            this._cssStyles.innerHTML+="@keyframes "+i+"{"+a[i]+"}\n\n";
        this._cssStyles.innerHTML+="\n\n/*style classes*/\n";
        a=this.styles;for (var i in a)
            this._cssStyles.innerHTML+=i+"\n{"+a[i]+"}\n\n";
        //console.log(this._cssStyles.innerHTML);
        return this;
    }

    _initDefaultStyles(){
        //textarea should be clear text
        //this.setStyle("textarea","resize: none;border:none; pointer-events: none;background:transparent",true);


        return this;
    }


    _addFunctionsToComicNode(cNode){
        //add image functions
        Object.assign(cNode,
            {
                delete://clean up
                    function(){
                        this.remove();
                        delete this.comic.added[this.id];
                        this.image= this.node=this.parent=this.comic=
                                    this.transform       =null;
                        return this;
                    }
                ,   
                remove://temporarly remove from parent
                    function(){
                        if (!this.isAdded) return this;
                        this.parent.node.removeChild(this.image)
                        this.isAdded=false;
                        return this;
                    }
                ,
                add://add to parent
                    function(filename=null){
                        //if filename provided, add nodes to this
                        //otherwise, add this node back if not added
                        if(filename){
                            return this.comic.add(filename,this);
                        }
                        //console.log("O:",this.parent)
                        if (this.isAdded) return this;
                        this.node=this.parent.node.appendChild(this.image)
                        this.isAdded=true;
                        
                        return this;
                    }
                ,
                setParent://Add to node
                    function(newParent){
                        parent=newParent
                        this.remove();
                        this.parent=parent;//parent.comic?parent.node:parent;
                        return this;
                    }
                ,

                applyTransform:
                    function(){
                        var t=this.transform;
                        t=
                        ` scale(${t.scale
                        }) translate(${t.position[0]}px, ${t.position[1]
                        }px) rotate(${t.rotation
                        }deg) skew(${t.skew[0]}deg,${t.skew[1]}deg)`;
                        //console.log(t)
                        this.node.style.transform=t;
                        return this;
                    }
                
                ,
                animate:
                    //repeat can be replaced by i for infinite or more settings
                    function(name,time=1,repeat=1){
                        if (!this.comic.allowActions)return this;

                        //i for infinity
                        if (isNaN(repeat)){
                            if (repeat.toLowerCase()=="i")
                                repeat="infinite";
                                else
                                console.log("settings")
                            }
                        else
                            repeat=repeat+" forwards"
                        //TODO: easing useing cubic-bezier(0.12, 0, 0.39, 0);
                        //TODO: Add help using https://cubic-bezier.com/#.42,0,.58,1
                        var a=this.node;
                        var _debug;
                        a.style.animation="none";a.offsetWidth;//force animation
                        a.style.animation=_debug=(name+" "+time+"s "+repeat);
                        //console.log(_debug)
                        return this;
                       
                    }
                //example comic.added[0].animatex("tester3a 1s linear ,tester3b 1s 1s ease-out forwards")
                ,animatex:
                    function(conf){
                        if (!this.comic.allowActions)return this;

                        var a=this.node;
                        a.style.animation="none";a.offsetWidth;//force animation
                        a.style.animation=conf;
                        return this;
                    }
                ,
                addClasses:
                    function(classNames){
                        if (typeof(classNames)=="string")
                            classNames=classNames.split(" ")
                        for (var i in classNames)
                            if (this.classNames.indexOf(classNames[i])==-1)
                                this.classNames+=" "+classNames[i];
                        this.classNames=this.classNames.trim();
                        this.node.className=this.classNames;
                        return this;
                    }
                ,
                removeClasses:
                    function(classNames){
                        if (typeof(classNames)=="string")
                            classNames=classNames.trim().split(" ")
                        for (var i in classNames)
                            if (this.classNames.indexOf(classNames[i])!=-1){
                                var s=classNames[i];
                                var a=this.classNames.split(" ");
                                //this.classNames=a.slice(0,a.indexOf(s)-1)+a.slice(a.indexOf(s)+s.length);
                                a.splice(a.indexOf(s),1);
                                this.classNames=a.join(" ");
                            }

                        this.classNames=this.classNames.trim();
                        this.node.className=this.classNames;
                        return this;
                    }
                ,
                self:
                    function(){return this}
            }
        );
        //repeated functions for convenience
        cNode.animation=cNode.animatex;


        //add textarea specific functions
        //if (cNode.node.tagName=="TEXTAREA")
        Object.assign(cNode,{
            setText:
                function(text){
                    this.node.innerHTML=text;
                    return this;
                }

        });
    }
    
}