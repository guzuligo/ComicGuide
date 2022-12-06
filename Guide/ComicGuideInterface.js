
(window.ComicGuide=window.ComicGuide||{}).interface =
class ComicInterface{
    constructor(manager){
        this.manager=manager;
        manager.interface=this;
    }
    reset(){

        //TODO:start with clean up
        var M=this.manager;
        var L=M.interfaceLayer;
        //M.comic.node.onclick=console.log
        M.comic.addEventListener(M.comic.node,"click",(e)=>this._onclick(e));

    }

    _onclick(e){

        if (e.layerX/this.manager.comic.width>=.5)
            this.manager.next();
        else
            this.manager.prev();
        
        //console.log("Interface event",e,comic.width)
        
    }
}