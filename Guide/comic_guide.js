
class ComicGuide{
    constructor(div,width=740,height=360,styleTag=""){
        this.div=div;
        this.document=div.getRootNode(); 
        this.width=width;
        this.height=height;
        this.body=div.parentElement.parentElement.parentElement;
        this.images={};
        this.added={};
        this.newid=0;

        this.styleTag=styleTag;
        this.animStyle=null;
        this.animations={};
        //Keep size consistant
        window.onresize=()=>{this.resize.call(this);}
        this._initStyles();
        this.resize();
    }


    _initStyles(tag=""){
        //style
        this.styleTag=tag;
        var s=this._makeMainStyle();
        var r=this.document;
        var st;
        st=r.createElement('style');st.type = 'text/css';
        st.innerHTML=s;
        r.getElementsByTagName('head')[0].appendChild(st);
        this.mainStyle=st;

        this.div.className="ComicMainDiv"+tag+" ComicNoMove"+tag;
        this.div.parentElement.className="ComicSuperDiv"+tag;
        this.div.parentElement.parentElement.className="Comic0Margin"+tag;



        st=r.createElement('style');st.type = 'text/css';
        r.getElementsByTagName('head')[0].appendChild(st);
        this.animStyle=st;

    }

    //useful to reset style by using this.mainStyle
    _makeMainStyle(tag=""){
        var s=".ComicMainDiv"+tag+"{\n\ttransform-origin: top left;overflow:hidden;margin-left: 0;\n"
        +"\twidth:"+this.width+"px;\n"
        +"\theight:"+this.height+"px;\n"
        +"\tmax-height:"+this.height+"px;"
        +"background-color: #443344;}\n";

        s+="\n.ComicSuperDiv"+tag+"{\n\toverflow:hidden;\n"
        +"\tmax-width:"+this.width+"px;\n"
        +"\theight:"+this.height+"px;\n"
        +"background-color: red;}\n";

        s+=".ComicNoMove"+tag+"{\n\tpointer-events: none;user-select: none;\n}"; 

        s+=".Comic0Margin"+tag+"{\n\tmargin-top: 0px;margin-bottom: 0px;"
          +"margin-right: 0px;margin-left: 0px;\n"
          +"}\n";
        return s;
    }


    resize(){
        var w=this.width;
        var h=this.height;
        var spr=this.div.parentElement;
        var div=this.div;
        var r= spr.getBoundingClientRect()
        var pp=this.body;//spr.parentElement.parentElement;
        var b=[pp.clientWidth,pp.clientHeight];
        if (b[0]/b[1]<w/h){
            b=[w,b[0]]
        }
        else{
            b=[h,b[1]]
        }
        var s=Math.min(b[0],b[1]) /b[0];
        div.style.transform="scale("+(s*100)+"%)";
        spr.style.width=(s*w)+"px";
        spr.style.height=(s*h)+"px";
        //console.log("Resize to spr " + r.right+", div " + spr.clientWidth)
        //console.log(b)
    }


    cacheImages(filenames=[]){
        this.image={}
        for (var i in filenames){
            //don't cache file with same name
            if (this.image[filenames[i]])
                continue;
            //create image node and cache it
            var m=new Image();
            m.src=filenames[i];//TODO: on load
            this.image[filenames[i]]=m;
        }
        return this;
    }

    clearPage(){
        for (var i in this.added)
            this.added[i].delete();
        this.newid=0;
    }

    getImage(filename){
        return this.image[filename];
    }

    //image file name stored in the database
    add(filename,parent=null){
        if (!this.image[filename]){
            console.warn("File %c\""+filename+"\"%cdoes not exists in the cache",'background:#002222');
            return null;
        }
        var img=this.image[filename].cloneNode();
        parent=parent || this.div;
        
        var cNode={
            id:this.newid,
            filename:filename,
            image:img,
            transform:{
                position:[0,0],
                rotation:0,
                scale:1,
                skew:[0,0],
            },
            isAdded:false,
            node:null,
            parent:parent.comic?parent.node:parent,
            comic:this,
        }

        this._addFunctionsToComicNode(cNode);
        //cNode.node=parent.appendChild(img);
        
        //add to inventory
        this.added[this.newid]=cNode;


        this.newid++;
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
        this.animStyle.innerHTML="";
        var a=this.animations;
        for (var i in a)
            this.animStyle.innerHTML+="@keyframes "+i+"{"+a[i]+"}";
        console.log(this.animStyle.innerHTML)
    }


    _addFunctionsToComicNode(cNode){
        Object.assign(cNode,
            {
                delete://clean up
                    function(){
                        this.remove();
                        delete this.comic.added[this.id];
                        this.image= this.node=this.parent=this.comic=
                                    this.transform       =null;
                        
                        
                    }
                ,   
                remove://temporarly remove from parent
                    function(){
                        if (!this.isAdded) return this;
                        this.parent.removeChild(this.image)
                        this.isAdded=false;
                        return this;
                    }
                ,
                add://add to parent
                    function(){
                        if (this.isAdded) return this;
                        this.node=this.parent.appendChild(this.image)
                        this.isAdded=true;
                    }
                ,
                setParent://Add to node
                    function(newParent){
                        parent=newParent
                        this.remove();
                        this.parent=parent.comic?parent.node:parent;

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
                    }
                
                ,
                animate:
                    function(name,time=1,repeat=1){
                        var a=this.node;
                        a.style.animation="none";a.offsetWidth;//force animation
                        a.style.animation=name+" "+time+"s "+repeat+" forwards";
                       
                    }
                ,
                self:
                    function(){return this}
            }
        );
    }
    
}