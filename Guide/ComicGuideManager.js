(window.ComicGuide=window.ComicGuide||{}).manager =
class ComicManager{
    constructor(ComicCanvas){
        this.comic=ComicCanvas;
        this._basicSetup();
    }

    _basicSetup(){
        var c=this.comic;
        var oldTag=c.addingTag;c.addingTag="manager";
        this.pageContainer=c.add(".div");//containing layers
        this.page=c.add(".div",this.pageContainer);
        this.interface=c.add(".div");
        c.addingTag=oldTag;
    }


    /* for page, following json format is used
    pageJsonSetup{
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
        var i;
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
        return cNode;
    }

    gotoPage(pageNumber){

    }

    

}