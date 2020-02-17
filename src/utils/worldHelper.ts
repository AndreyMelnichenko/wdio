export class WorldHelper {
     public static addObjectToWorld(customObject: object){
          this['store'] = Object.assign({}, this['store'], customObject);
     }
}
