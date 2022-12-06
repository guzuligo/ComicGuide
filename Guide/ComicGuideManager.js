(window.ComicGuide=window.ComicGuide||{}).manager =
class ComicManager{
    constructor(ComicCanvas){
        
        this.comic=ComicCanvas;
        this.comic.manager=this;

        this.jsonComic={};
        this._basicSetup();
        this.pageNumber=-1;
        
        //for timer events
        this.timelineTick=100;//milliseconds for next tick
        this.time=-1;//how many ticks passed
        this.timelimit=10000;
        this.timeline={};//events on ticks in the following format:
        /*
        {
            time:[ //events
                [   function()  ] 
            ]
        }*/
        this.nextTick();


        this.interfaceLayer=null;
        this.interface=null;
    }

    nextTick(){
        //Do we have actions to execute?
        if (this.time>0 && this.timeline[this.time]){
            var t=this.timeline[this.time];
            //execute functions
            console.log("yo?",t)
            for (var i in t){
                console.log("yaa",t[i])
                t[i]();
            }
        }
        window.setTimeout(()=>this.nextTick(),this.timelineTick);
        if(this.time<this.timelimit)
            this.time++;
    }

    _basicSetup(){
        var c=this.comic;
        var oldTag=c.addingTag;c.addingTag="manager";
        this.pageContainer=c.add(".div");//containing layers
        this.page=c.add(".div",this.pageContainer);
        this.interfaceLayer=c.add(".div");
        c.addingTag=oldTag;
        return this;
    }

    /*
    jsonComic={
        folder:"./",// folder containing images
        images:[],// array of images
        pages:[],// all pages. See setPage for page object
        css:{
            animations:[[name:string,value:string of css]] see canvas setAnimation
            styles:[[name:string,value:string of css,parentCss]] see canvas setStyle

        }
    }
    */
    load(jsonComic){
        this.pageNumber=0;
        
        var c=this.comic.clearCachedImages().clearPage().deleteCss(true);
        this._basicSetup();
        if (this.interface)
            this.interface.reset();

        var t;
        this.jsonComic=jsonComic;
        this.comic.cacheImages(jsonComic.images,jsonComic.folder||"./");
        
        t=jsonComic.css.styles;
        for (var i in t)
            c.setStyle(t[i][0],t[i][1],t[i][2]);
        t=jsonComic.css.animations;
        for (var i in t)
            c.setAnimation(t[i][0],t[i][1]);
        
        return this;
    }

    //return true if successfully went to next page
    goto(pageNumber){
        if (pageNumber>=this.jsonComic.pages.length || pageNumber<0)
            return false;
        //console.log("page: ",this.jsonComic.pages[pageNumber]  )
        this.newPage(   
            this.jsonComic.pages[pageNumber],
            pageNumber==this.pageNumber+1
        );
        this.pageNumber=pageNumber;
        return true;
    }

    //next page
    next(){
        this.goto(this.pageNumber+1);
    }

    //previous page
    prev(){
        this.goto(this.pageNumber-1);
    }


    /* for page, following json format is used
    >>  pageJsonSetup{
        exceptions:["x1","x2","x3"],

        layers:[
            layer array
                [
                    elementConf
                    {
                        "node":"filename" ** if null, layer will be affected
                        "class":["classes","animations"]
                        "children":[elements]
                        "properties":{}           //example:{innerHTML:"hello"}

                        //if layer:
                        "tag": extra tag for this layer

                    }


                ]
        ]
    }
    */
    setPage(pageJsonSetup,useExceptions=false){
        var c=this.comic;
        var i;
        var oldTag=c.addingTag;c.setTag("page");
        for (var _layerNumber in pageJsonSetup.layers){
            var L=pageJsonSetup.layers[_layerNumber];

            //skip layer if in exceptions
            if (useExceptions && pageJsonSetup.exceptions){
                var x=false;
                var xx=pageJsonSetup.exceptions;

                if(!L.tag)console.log(L)

                var cNodeL;
                for (i in L)
                    if (!L[i].node){
                        cNodeL=L[i];
                        break;
                    }
                

                if(cNodeL)for (i in xx)
                    if (cNodeL.tag.indexOf(xx[i])!=-1){
                        x=true;break;
                    }

                if (x)
                    {
                        //console.log("found",L);
                        continue;
                    }
            }//end skip layer

            var l=this.comic.add(".div",this.page);
            

            for (var e in L){
                e=L[e];
                if(e.node)
                    this.addNode(e,l)
                else
                    this._addNodeConf(e,l);
                
            }

        }
        c.addingTag=oldTag;
        return this;
    }

    clearPage(tag="*page",exceptions=null){
        //remove page and add new blank one
        this.comic.clearPage(tag,exceptions);
        //this.page.remove();
        //this.page=this.comic.add(".div",this.pageContainer);
        return this;
    }

    newPage(pageJsonSetup,useExceptions=false){
        return this.clearPage("*page",useExceptions?pageJsonSetup.exceptions:null).setPage(pageJsonSetup,useExceptions);
    }

    addNode(elementConf,parent){
        
        var cNode=this.comic.add(elementConf.node,parent);
        return this._addNodeConf(elementConf,cNode);
    }

    _addNodeConf(elementConf,cNode){
        var i,e;
        if (elementConf.class)
            cNode.animate(elementConf.class[1]||"").addClasses(elementConf.class[0]||"");

        
        if(elementConf.properties)
            for (i in elementConf.properties){
                cNode.node[i]=elementConf.properties[i];
                //console.log("AAA:",i,elementConf.properties[i],cNode.node)
            }
        
        if (elementConf.tag)
            cNode.tag+=elementConf.tag;
        else if(cNode.parent.tag)
            cNode.tag+=cNode.parent.tag;

            

        if (elementConf.children)
            for (i in elementConf.children)
                this.addNode(elementConf.children[i],cNode);

        if (elementConf.timeline){
             e=elementConf.timeline;
            for ( i in e){
                console.log(">>",i)
                if (!this.timeline[i])
                    this.timeline[i]=[];
                this.timeline[i].push(
                    ()=>{console.log("exe",e[i]);e[i].call(cNode);}
                );
            }
        }
        return cNode;
    }




 

    

}