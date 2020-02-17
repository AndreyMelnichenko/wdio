import {expect} from "chai";
import {Helper} from "../../utils/helper";
import {BasePage} from "../base.page";
import {IRcwLocation} from "./IRcwLocation";

export class AddLocationPage {

    private rcwDate:IRcwLocation;
    private customWorld:any;

    constructor(rcwDate:IRcwLocation, world: any){
        this.rcwDate=rcwDate;
        this.customWorld=world;
    }

    private setDropDownValue(value:string, dropdownName:string):void{
        const targetValue = Helper.replaceWithWorldValue(value, this.customWorld);
        BasePage.useSelectizeDropDown(targetValue, dropdownName, false, true);
        expect(BasePage.getInputDataValue(dropdownName).toLocaleLowerCase()).to.equal(targetValue.toLocaleLowerCase());
    }

    private setTextField(value:string, fieldName:string):void{
        value = Helper.replaceWithWorldRandom(value, this.customWorld);
        const erValue = BasePage.setInputValue(value, fieldName);
        expect(erValue, 'Inserted value not equal to field').to.equal(value);
    }

    private isDropDown(elementName:string):boolean{
        switch (elementName) {
            case "Country":
            case "State / County / Region":
            case "Town / City":
            case "Business Category":
                return true;
            default:
                return false;
        }
    }

    private setValue(key:string):AddLocationPage{
        if(this.isDropDown(key)){
            this.setDropDownValue(this.rcwDate[key],key)
        }else{
            this.setTextField(this.rcwDate[key],key);
        }
        return this;
    }

    public fulfillRcwAddLocation():void{
        Object.keys(this.rcwDate).forEach(key => {
            this.setValue(key);
        });
    }

}
