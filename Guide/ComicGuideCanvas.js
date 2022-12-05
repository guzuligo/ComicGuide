
//configure
//this.body to use the main html for resizing
//this.margin to add a margin to resizing

(window.ComicGuide=window.ComicGuide||{}).canvas =
class ComicGuide{
    constructor(div,width=740,height=360,styleTag=""){
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
        this.maxScale=1;
        
        this._autoRefresh=true;//trigger refresh events instead of waiting for a call



        //Keep size consistant
        window.addEventListener("resize",()=>{this.resize.call(this);});

        //initialize styles
        this._initStyles()._initDefaultStyles();


        this.resize();
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

        this.node.className="ComicMainDiv"+tag+" ComicNoSelect"+tag;
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
        this.node.onclick=(a)=>console.log(a)
    }

    //useful to reset style by using this.mainStyle
    _makeMainStyle(){
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


    cacheImages(filenames=[],folder="./"){
        this.image={};
        folder=folder.trim();
        if (folder[folder.length-1]!="/")
            folder=folder+"/"
        for (var i in filenames){
            //don't cache file with same name
            if (this.image[filenames[i]])
                continue;
            //create image node and cache it
            var m=new Image();
            m.src=folder+filenames[i];//TODO: on load
            m.className="ComicNoMove"+this.styleTag;
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
    }

    clearPage(){
        for (var i in this.added)
            this.added[i].delete();
        this._newid=0;
        return this;
    }

    getImage(filename){
        return this.image[filename];
    }

    //image file name stored in the database
    //filename starts with dot for non-image nodes
    add(filename,parent=null){
        var img;

        if (filename[0]!="."){
            if (!this.image[filename]){
                console.warn("File %c\""+filename+"\"%cdoes not exists in the cache",'background:#002222');
                return null;
            }
            img=this.image[filename].cloneNode();
        }else{
            filename=filename.substr(1);
            img=this.document.createElement(filename);
        }
        parent=parent || this;//.div;
        
        var cNode={
            id:this._newid,
            filename:filename,
            image:img,
            classNames:"ComicNoMove"+this.styleTag,
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
        }

        this._addFunctionsToComicNode(cNode);
        //cNode.node=parent.appendChild(img);
        
        //add to inventory
        this.added[this._newid]=cNode;


        this._newid++;
        //add to div
        cNode.add();
        

        //https://www.w3schools.com/cssref/css3_pr_transform.php
        cNode.node.style.position="absolute"
        cNode.node.style.left="0px"
        cNode.node.style.top="0px"
        return cNode;
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
            (comicMainDivChildrenOnly?".ComicMainDiv"+this.styleTag+" > ":"")+
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

    _refreshStyles(){
        this._cssStyles.innerHTML="";
        var a;
        this._cssStyles.innerHTML+="/*animation keyframes*/\n";
        a=this.animations;for (var i in a)
            this._cssStyles.innerHTML+="@keyframes "+i+"{"+a[i]+"}";
        this._cssStyles.innerHTML+="\n\n/*style classes*/\n";
        a=this.styles;for (var i in a)
            this._cssStyles.innerHTML+=i+"{"+a[i]+"}";
        console.log(this._cssStyles.innerHTML);
        return this;
    }

    _initDefaultStyles(){
        //textarea should be clear text
        this.setStyle("textarea","resize: none;border:none; pointer-events: none;background:transparent",true);


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
                        console.log("O:",this.parent)
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
                        console.log(t)
                        this.node.style.transform=t;
                        return this;
                    }
                
                ,
                animate:
                    //repeat can be replaced by i for infinite or more settings
                    function(name,time=1,repeat=1){
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
                            classNames=classNames.split(" ")
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