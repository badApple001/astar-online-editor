import { FindPathExample } from "./FindPathExample";
import { HtmlUtils } from "./HtmlUtils";
import { TextureUtils } from "./TextureUtils";
import { MapEditor } from "./Visual/MapEditor";

export default class Entry {

    editor: MapEditor;
    findpathDemp: FindPathExample;
    constructor() {
        Laya.stage.bgColor = "#59b7f4";
        this.editor = new MapEditor();
        this.editor.open();
        this.findpathDemp = new FindPathExample(this.editor.scrollView);
        this.findpathDemp.editor = this.editor;
        this.editor.findPathHandler = Laya.Handler.create(this.findpathDemp, this.findpathDemp.Move, undefined, false);
        this.editor.visualStepHandler =  Laya.Handler.create(this.findpathDemp, this.findpathDemp.Simulation, undefined, false);
        HtmlUtils.EnableDropFile(Laya.Handler.create(this, fileName => {
            if (typeof fileName == "string")
                this.editor.SetBg(fileName);
            else
                this.editor.LoadMapByJson(fileName);
        }, undefined, false));
    }

}