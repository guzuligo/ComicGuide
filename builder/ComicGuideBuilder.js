
(window.ComicGuide=window.ComicGuide||{}).builder =
class ComicBuilder{
    constructor(){
        this.comic={
            canvas:null,
            manager:null,
            interface:null,
            frame:null,
            container:null,
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

        

    }

    init(force_use_config=false){
        //
        var F=force_use_config;
        var c,elm,d,dd;
        c=this.comic;
        dd=(sss)=>document.getElementById(sss);
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
            
            c.container.style.resize="both";
            c.container.style.overflow="auto"
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
}