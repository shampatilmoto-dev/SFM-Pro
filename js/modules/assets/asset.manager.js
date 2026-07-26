"use strict";

const ASSET_STORAGE_KEY = "sfm_asset_records_v1";
const ALLOWED_CATEGORIES = Object.freeze(["Property", "Vehicle", "Electronics", "Jewellery", "Furniture", "Equipment", "Other"]);

function cleanText(value, length = 160) { return String(value ?? "").trim().slice(0, length); }
function cleanAmount(value) { const amount = Number(value); return Number.isFinite(amount) && amount >= 0 ? amount : 0; }

/** Local, additive asset registry that does not alter SFM_DATABASE. */
class AssetManager {
    /** Return all asset records. @returns {Object[]} Asset records. @throws {Error} If stored data is corrupt. */
    static getAll() {
        const value = JSON.parse(localStorage.getItem(ASSET_STORAGE_KEY) || "[]");
        if (!Array.isArray(value)) throw new Error("Asset data is unavailable.");
        return value;
    }
    /** Save an asset. @param {Object} data Asset form data. @returns {Object} Saved asset. @throws {Error} If required values are invalid. */
    static save(data) {
        const name = cleanText(data.name, 100); const purchaseValue = cleanAmount(data.purchaseValue);
        if (!name) throw new Error("Asset name is required.");
        if (!ALLOWED_CATEGORIES.includes(data.category)) throw new Error("Choose a valid asset category.");
        if (!purchaseValue) throw new Error("Purchase value must be greater than zero.");
        const records = AssetManager.getAll();
        const record = {id: crypto.randomUUID(), name, category:data.category, purchaseDate:cleanText(data.purchaseDate,10), purchaseValue, currentValue:cleanAmount(data.currentValue)||purchaseValue, marketValue:cleanAmount(data.marketValue), location:cleanText(data.location), warrantyUntil:cleanText(data.warrantyUntil,10), amcUntil:cleanText(data.amcUntil,10), insuranceUntil:cleanText(data.insuranceUntil,10), invoiceName:cleanText(data.invoiceName), photoName:cleanText(data.photoName), notes:cleanText(data.notes,500), createdAt:new Date().toISOString()};
        records.unshift(record); localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(records)); return record;
    }
    /** Delete an asset. @param {string} id Asset ID. @returns {boolean} True if removed. @throws {Error} For an invalid ID. */
    static delete(id) { if (!id || id.includes("/")) throw new Error("Invalid asset ID."); const records=AssetManager.getAll(); const next=records.filter(x=>x.id!==id); localStorage.setItem(ASSET_STORAGE_KEY,JSON.stringify(next)); return next.length!==records.length; }
    /** Calculate registry totals. @returns {{count:number,purchaseValue:number,currentValue:number,marketValue:number,depreciation:number}} Totals. */
    static totals() { const records=AssetManager.getAll(); return records.reduce((t,x)=>({count:t.count+1,purchaseValue:t.purchaseValue+x.purchaseValue,currentValue:t.currentValue+x.currentValue,marketValue:t.marketValue+(x.marketValue||x.currentValue),depreciation:t.depreciation+Math.max(0,x.purchaseValue-x.currentValue)}),{count:0,purchaseValue:0,currentValue:0,marketValue:0,depreciation:0}); }
}

globalThis.AssetManager = AssetManager;
export { ALLOWED_CATEGORIES, ASSET_STORAGE_KEY, AssetManager };
