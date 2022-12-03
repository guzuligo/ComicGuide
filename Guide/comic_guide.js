
class ComicGuide{
    constructor(div,width=740,height=360){
        this.div=div;
        this.document=div.getRootNode(); 
        this.width=width;
        this.height=height;
        this.body=div.parentElement.parentElement.parentElement;

        //Keep size consistant
        window.onresize=()=>{this.resize.call(this);}
        this._initStyles();
        this.resize()
    }


    _initStyles(){
        //style
        var s=".ComicMainDiv{\n\ttransform-origin: top left;overflow:hidden;margin-left: 0;\n"
        +"\twidth:"+this.width+"px;\n"
        +"\theight:"+this.height+"px;\n"
        +"\tmax-height:"+this.height+"px;"
        +"background-color: #443344;}\n";

        s+="\n.ComicSuperDiv{\n\toverflow:hidden;\n"
        +"\tmax-width:"+this.width+"px;\n"
        +"\theight:"+this.height+"px;\n"
        +"background-color: red;}\n";

        s+=".ComicNoMove{\n\tpointer-events: none;user-select: none;\n}"; 

        s+=".Comic0Margin{\n\tmargin-top: 0px;margin-bottom: 0px;"
          +"margin-right: 0px;margin-left: 0px;\n"
          +"}\n";
        var r=this.document;
        var st=r.createElement('style');st.type = 'text/css';
        st.innerHTML=s;r.getElementsByTagName('head')[0].appendChild(st);
        
        this.div.className="ComicMainDiv ComicNoMove";
        this.div.parentElement.className="ComicSuperDiv"
        this.div.parentElement.parentElement.className="Comic0Margin"
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
            var m=new Image();
            m.src=filenames[i];
            this.image[filenames[i]]=m;
        }
        return this;
    }

    getImage(filename){
        return this.image[filename];
    }

    //image file name stored in the database
    add(filename){
        obj={
            filename:filename,
            image:this.image[filename].cloneNode(),
        }

        return obj;
    }
    
}