export interface ThriftServiceProvider<T> {
    readAll(collection: string): Promise<T[]>;
    find(id: string): Promise<T>;
    addDoc(entity: T): Promise<string>;
    deleteDoc(id: string): Promise<void>;
    editDoc(id: string): Promise<void>
}