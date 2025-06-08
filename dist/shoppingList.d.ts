interface Booking {
    id: string;
    guest_count: number;
    package_name: string;
    event_date: string;
    additional_notes?: string;
}
interface ShoppingItem {
    category: string;
    item: string;
    quantity: string;
    unit: string;
    notes?: string;
}
export declare class ShoppingListService {
    private menuPackages;
    generateShoppingList(booking: Booking): Promise<ShoppingItem[]>;
    formatShoppingListForEmail(shoppingList: ShoppingItem[]): string;
    exportShoppingListToPDF(shoppingList: ShoppingItem[], booking: Booking): string;
}
export {};
//# sourceMappingURL=shoppingList.d.ts.map