export type FieldType = 'text'|'number'|'date'|'select'|'boolean'|'email'|'currency';
export type Field = { name:string; label:string; type:FieldType; required?:boolean; options?:string[]; ref?:string };
export type EntitySchema = { name:string; label:string; fields:Field[]; };
export type ModuleSchema = { id:string; label:string; entities:EntitySchema[] };
export type AppConfig = {
  appName:string; dataSource:'rest'|'local'; roles:string[]; defaultRole:string;
  modules:ModuleSchema[]; navigation:Array<{moduleId:string; entity:string; label?:string}>;
}
