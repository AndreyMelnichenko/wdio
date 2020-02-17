export class RcwKeywordSettings {
    private h2Header:string="//h2[text()='Keyword settings']";
    private keyWordsTextArea:string="[name='search_terms']";
    private searchEngine:string="//input[@name='search_engines[]' and @value='%s']";
    private avaliableSearchEngines:string="//input[@name='search_engines[]' and @type='checkbox'][not(@disabled)]";

    public waitPageOpened():RcwKeywordSettings{
        $(this.h2Header).waitForDisplayed();
        return this;
    }

    public setKeyWords(keyWords:string): RcwKeywordSettings{
        $(this.keyWordsTextArea).waitForDisplayed(5000);
        $(this.keyWordsTextArea).setValue(keyWords);
        return this;
    }

    public isEngineExists(engineName:string):boolean{
        $(this.searchEngine.replace("%s",engineName)).isClickable();
        return true;
    }

    public checkAllSarchEngines():RcwKeywordSettings{
        const avaliableSearchEngineNames = this.getAllAvaliableSearchEngineNames();
        avaliableSearchEngineNames.map((element)=>{
            this.checkSearchEngine(element);
        });
        return this;
    }

    public checkSpecificSearchEngines(listSearchEngines:string[]):RcwKeywordSettings{
        listSearchEngines.map((element)=>{
            this.checkSearchEngine(element);
        });
        return this;
    }

    private checkSearchEngine(engineName:string):void{
        $(this.searchEngine.replace("%s",engineName)).click();
    }

    private getAllAvaliableSearchEngineNames():string[]{
        const searchEngineName:string[]=[];
        $$(this.avaliableSearchEngines).map((element)=>{
            searchEngineName.push(element.getAttribute("value"));
        });
        return searchEngineName;
    }
}
