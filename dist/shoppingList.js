"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingListService = void 0;
class ShoppingListService {
    constructor() {
        this.menuPackages = {
            'Essential Celebration': {
                meat: {
                    'Beef (Silverside/Topside)': { perPerson: 0.25, unit: 'kg' },
                    'Pork Shoulder': { perPerson: 0.15, unit: 'kg' },
                    'Chicken (Whole)': { perPerson: 0.2, unit: 'kg' },
                    'Boerewors': { perPerson: 0.1, unit: 'kg' }
                },
                sides: {
                    'Potato Salad': { perPerson: 0.15, unit: 'kg' },
                    'Coleslaw': { perPerson: 0.1, unit: 'kg' },
                    'Green Salad': { perPerson: 0.1, unit: 'kg' },
                    'Garlic Bread': { perPerson: 2, unit: 'slices' }
                },
                condiments: {
                    'Tomato Sauce': { perPerson: 0.02, unit: 'kg' },
                    'Mustard': { perPerson: 0.01, unit: 'kg' },
                    'Chutney': { perPerson: 0.015, unit: 'kg' }
                },
                equipment: {
                    'Disposable Plates': { perPerson: 2, unit: 'pieces' },
                    'Disposable Cups': { perPerson: 3, unit: 'pieces' },
                    'Serviettes': { perPerson: 4, unit: 'pieces' },
                    'Plastic Cutlery Sets': { perPerson: 1, unit: 'set' }
                }
            },
            'Premium Feast': {
                meat: {
                    'Beef (Ribeye/Sirloin)': { perPerson: 0.3, unit: 'kg' },
                    'Lamb Leg': { perPerson: 0.2, unit: 'kg' },
                    'Pork Ribs': { perPerson: 0.25, unit: 'kg' },
                    'Chicken (Free Range)': { perPerson: 0.25, unit: 'kg' },
                    'Boerewors (Premium)': { perPerson: 0.15, unit: 'kg' }
                },
                sides: {
                    'Roasted Vegetables': { perPerson: 0.2, unit: 'kg' },
                    'Potato Salad (Gourmet)': { perPerson: 0.15, unit: 'kg' },
                    'Greek Salad': { perPerson: 0.12, unit: 'kg' },
                    'Garlic Bread (Artisan)': { perPerson: 2, unit: 'slices' },
                    'Rice Salad': { perPerson: 0.1, unit: 'kg' }
                },
                condiments: {
                    'Gourmet Sauces': { perPerson: 0.025, unit: 'kg' },
                    'Herb Butter': { perPerson: 0.02, unit: 'kg' },
                    'Specialty Chutneys': { perPerson: 0.02, unit: 'kg' }
                },
                equipment: {
                    'Quality Disposable Plates': { perPerson: 2, unit: 'pieces' },
                    'Disposable Wine Glasses': { perPerson: 2, unit: 'pieces' },
                    'Disposable Cups': { perPerson: 2, unit: 'pieces' },
                    'Linen-look Serviettes': { perPerson: 4, unit: 'pieces' },
                    'Quality Cutlery Sets': { perPerson: 1, unit: 'set' }
                }
            },
            'Budget Braai': {
                meat: {
                    'Beef (Chuck/Brisket)': { perPerson: 0.2, unit: 'kg' },
                    'Chicken (Portions)': { perPerson: 0.2, unit: 'kg' },
                    'Boerewors': { perPerson: 0.15, unit: 'kg' }
                },
                sides: {
                    'Potato Salad': { perPerson: 0.12, unit: 'kg' },
                    'Coleslaw': { perPerson: 0.1, unit: 'kg' },
                    'Bread Rolls': { perPerson: 2, unit: 'pieces' }
                },
                condiments: {
                    'Tomato Sauce': { perPerson: 0.015, unit: 'kg' },
                    'Mustard': { perPerson: 0.01, unit: 'kg' }
                },
                equipment: {
                    'Paper Plates': { perPerson: 2, unit: 'pieces' },
                    'Paper Cups': { perPerson: 2, unit: 'pieces' },
                    'Serviettes': { perPerson: 3, unit: 'pieces' },
                    'Basic Cutlery': { perPerson: 1, unit: 'set' }
                }
            }
        };
    }
    async generateShoppingList(booking) {
        const packageData = this.menuPackages[booking.package_name] || this.menuPackages['Essential Celebration'];
        const guestCount = booking.guest_count;
        const shoppingList = [];
        // Add buffer for extra guests (10% more)
        const adjustedGuestCount = Math.ceil(guestCount * 1.1);
        // Generate meat items
        for (const [item, data] of Object.entries(packageData.meat)) {
            const quantity = (data.perPerson * adjustedGuestCount).toFixed(2);
            shoppingList.push({
                category: 'Meat',
                item,
                quantity,
                unit: data.unit
            });
        }
        // Generate side dishes
        for (const [item, data] of Object.entries(packageData.sides)) {
            const quantity = data.unit === 'pieces' || data.unit === 'slices'
                ? Math.ceil(data.perPerson * adjustedGuestCount).toString()
                : (data.perPerson * adjustedGuestCount).toFixed(2);
            shoppingList.push({
                category: 'Sides',
                item,
                quantity,
                unit: data.unit
            });
        }
        // Generate condiments
        for (const [item, data] of Object.entries(packageData.condiments)) {
            const quantity = (data.perPerson * adjustedGuestCount).toFixed(2);
            shoppingList.push({
                category: 'Condiments',
                item,
                quantity,
                unit: data.unit
            });
        }
        // Generate equipment/disposables
        for (const [item, data] of Object.entries(packageData.equipment)) {
            const quantity = Math.ceil(data.perPerson * adjustedGuestCount).toString();
            shoppingList.push({
                category: 'Equipment & Disposables',
                item,
                quantity,
                unit: data.unit
            });
        }
        // Add essential spitbraai equipment
        shoppingList.push({
            category: 'Equipment & Disposables',
            item: 'Charcoal',
            quantity: Math.ceil(guestCount / 25).toString(),
            unit: 'bags (7kg)',
            notes: 'Hardwood charcoal preferred'
        }, {
            category: 'Equipment & Disposables',
            item: 'Firelighters',
            quantity: '2',
            unit: 'boxes',
        }, {
            category: 'Equipment & Disposables',
            item: 'Aluminum Foil',
            quantity: '2',
            unit: 'rolls',
            notes: 'Heavy duty'
        }, {
            category: 'Equipment & Disposables',
            item: 'Cleaning Supplies',
            quantity: '1',
            unit: 'set',
            notes: 'Sanitizer, cloths, bin bags'
        });
        // Add special notes if any
        if (booking.additional_notes) {
            shoppingList.push({
                category: 'Special Requirements',
                item: 'Custom Items',
                quantity: '1',
                unit: 'set',
                notes: booking.additional_notes
            });
        }
        console.log(`📋 Generated shopping list for ${guestCount} guests (${booking.package_name})`);
        return shoppingList;
    }
    formatShoppingListForEmail(shoppingList) {
        const categories = [...new Set(shoppingList.map(item => item.category))];
        let formatted = `
<div style="font-family: Arial, sans-serif;">
  <h2 style="color: #ff6b35;">🛒 Shopping List</h2>
`;
        categories.forEach(category => {
            const categoryItems = shoppingList.filter(item => item.category === category);
            formatted += `
  <h3 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">${category}</h3>
  <ul style="list-style-type: none; padding: 0;">
`;
            categoryItems.forEach(item => {
                formatted += `
    <li style="padding: 5px 0; border-bottom: 1px solid #eee;">
      <strong>${item.item}:</strong> ${item.quantity} ${item.unit}
      ${item.notes ? `<br><em style="color: #666; font-size: 0.9em;">Note: ${item.notes}</em>` : ''}
    </li>
`;
            });
            formatted += `  </ul>`;
        });
        formatted += `</div>`;
        return formatted;
    }
    exportShoppingListToPDF(shoppingList, booking) {
        // This would integrate with a PDF generation library
        // For now, return a formatted text version
        const categories = [...new Set(shoppingList.map(item => item.category))];
        let content = `SPITBRAAI SHOPPING LIST\n`;
        content += `Event Date: ${new Date(booking.event_date).toLocaleDateString()}\n`;
        content += `Guest Count: ${booking.guest_count}\n`;
        content += `Package: ${booking.package_name}\n`;
        content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        categories.forEach(category => {
            const categoryItems = shoppingList.filter(item => item.category === category);
            content += `${category.toUpperCase()}\n`;
            content += '='.repeat(category.length) + '\n';
            categoryItems.forEach(item => {
                content += `• ${item.item}: ${item.quantity} ${item.unit}`;
                if (item.notes)
                    content += ` (${item.notes})`;
                content += '\n';
            });
            content += '\n';
        });
        return content;
    }
}
exports.ShoppingListService = ShoppingListService;
//# sourceMappingURL=shoppingList.js.map