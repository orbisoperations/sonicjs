export interface SchemaExporter {
    lookupTable(name:string)
    lookupSchema(name: string)
    getRoutes(): ApiConfig[]
}

export interface ApiConfig {
table: string;
route: string;
}