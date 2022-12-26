(window.ComicGuide=window.ComicGuide||{}).compiler =
class ComicCompiler{
    constructor(sourceConfig){
        this.config=sourceConfig;
        this.result="";
        this.parentIsResizable=false;//See _strComicDivs()

        this.cndPath="https://cdn.jsdelivr.net/gh/guzuligo/ComicGuide@master/Guide/";
        this.placeholder="\"\"\"'''```";
    }

    compile(config=null){
        if (config)
            this.config=config;
        var html="";
        var ph=this.placeholder;
        var mainVars="var comic,manager,interface;"
        var mainVarsSetup=
            "comic=new ComicGuide.canvas($comic$,comicConfig.width,comicConfig.height);\n"
                                .replace("$comic$","document.getElementById(comicConfig.comic)")
        +"manager=new ComicGuide.manager(comic);\n"
        +"interface=new ComicGuide.interface(manager);\n";

        var loadCode="comic.maxSize=comicConfig.maxSize;\n"+
            "comic.resize();\nmanager.load(comicConfig.setup,true).goto(0);\n"

        var loader=mainVars+"\nfunction loadComic(){\n"+mainVarsSetup+"\n"+loadCode+"\n}";
        var body="<body onload='loadComic();' class='Comic0Margin'>\n"+this._strComicDivs()+"\n</body>"
        html+="<html><header>\n"+this._strJsFiles()+ph+"1"+"\n</header>\n"+ph+"2"+"\n</html>";
        html=html.replace(ph+"2",body);
        html=html.replace(ph+"1",this._strConfigScript(loader));
        
        this.result=html;
        return this;
    }

    //returns the javascript files required
    _strJsFiles(){
        var path=this.cndPath;
        return ""
        +"<script src='"+path+"ComicGuideCanvas.js'></script>\n"
        +"<script src='"+path+"ComicGuideInterface.js'></script>\n"
        +"<script src='"+path+"ComicGuideManager.js'></script>\n";
    }

    _strComicDivs(){
        var r=  '<div id="frame" style="width: 100%; height:100%">\n'+
                '<div><div id="comic">\n</div></div></div>';
        if (this.parentIsResizable){
            r='<div id="container" class="resizable"'+//TODO:Fix width and height.. maybe
            'style="float:left;resize: both;overflow: auto;width: 740px; height: 360px;">\n'
            +r+"\n</div>"
        }
        
        return r;
    }

    _strConfigScript(nextScript=""){
        
        var r= "var comicConfig="+JSON.stringify(this.config);
        r="<script>\n"+r+"\n"+nextScript+"</script>";
        return r;
    }

}