(window.ComicGuide=window.ComicGuide||{}).manager =
class ComicManager{
    constructor(ComicCanvas){
        this.comic=ComicCanvas;
        this._basicSetup();
    }

    _basicSetup(){
        var c=this.comic;
        this.pageContainer=c.add(".div");//containing layers
        this.page=c.add(".div",this.pageContainer);
        this.interface=c.add(".div");
    }


    /* 
    jsonSetup{
        layers:[
            layer array
                [
                    elementConf
                    {
                        "node":"filename"
                        "class":["classes","animations"]
                        "children":[elements]
                        "properties":{}           //example:{innerHTML:"hello"}
                    }
                ]
        ]
    }
    */
    setPage(jsonSetup){
        var c=this.comic;
        for (var _layerNumber in jsonSetup.layers){
            var l=this.comic.add(".div",this.page);
            var L=jsonSetup.layers[_layerNumber];

            for (var e in L){
                e=L[e];
                if(e)
                    this.addNode(e,l);
                else
                    console.warn("No Node");//TODO: can be used to config layer
            }

        }
    }

    clearPage(){
        //remove page and add new blank one
        this.page.remove();
        this.page=this.comic.add(".div",this.pageContainer);
    }

    addNode(elementConf,parent){
        var i;
        var cNode=this.comic.add(elementConf.node,parent);
        if (elementConf.class)
            cNode.animate(elementConf.class[1]||"").addClasses(elementConf.class[0]||"");

        
        if(elementConf.properties)
            for (i in elementConf.properties){
                cNode.node[i]=elementConf.properties[i];
                //console.log("AAA:",i,elementConf.properties[i],cNode.node)
            }

        if (elementConf.children)
            for (i in elementConf.children)
                this.addNode(elementConf.children[i],cNode);
        return cNode;
    }

    

}