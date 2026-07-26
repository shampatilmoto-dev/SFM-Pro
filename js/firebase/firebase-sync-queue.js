"use strict";

import { AuthenticationManager } from "../managers/authentication.manager.js";
import { syncDashboard, syncLocalChange, syncModule } from "./firebase-sync.js";

const QUEUE_KEY = "SFM_FIREBASE_OFFLINE_QUEUE";
const QUEUE_VERSION = 1;
const MAX_QUEUE_ITEMS = 500;
const BACKGROUND_INTERVAL_MS = 60_000;
let flushPromise = null;
let backgroundTimer = null;

function safeParse(raw, fallback) { try { return JSON.parse(raw) ?? fallback; } catch (_error) { return fallback; } }
function currentUid() { const uid=AuthenticationManager.getCurrentUser?.()?.uid; return typeof uid==="string"?uid.trim():""; }
function readQueue() { const value=safeParse(localStorage.getItem(QUEUE_KEY),null); return value?.version===QUEUE_VERSION&&Array.isArray(value.items)?value:{version:QUEUE_VERSION,items:[]}; }
function writeQueue(queue) { localStorage.setItem(QUEUE_KEY,JSON.stringify({version:QUEUE_VERSION,items:queue.items.slice(-MAX_QUEUE_ITEMS)})); dispatchStatus(); }
function recordId(value) { return typeof value==="string"?value:String(value?.id??""); }
function itemKey(item) { return `${item.uid}|${item.kind}|${item.module}|${recordId(item.value)}`; }
function dispatchStatus(){if(typeof document!=="undefined"&&typeof CustomEvent==="function")document.dispatchEvent(new CustomEvent("sfm:sync-queue-status",{detail:getSyncQueueStatus()}));}

/** Add or coalesce a user-scoped synchronization request. @param {Object} request Queue request. @returns {Object} Stored request. @throws {Error} If queue capacity cannot be maintained. */
function enqueue(request){const queue=readQueue();const item={id:crypto.randomUUID(),uid:currentUid(),kind:request.kind,module:request.module,operation:request.operation??"full",value:request.value??null,createdAt:new Date().toISOString(),attempts:0,lastError:null};const key=itemKey(item);queue.items=queue.items.filter(existing=>itemKey(existing)!==key);queue.items.push(item);writeQueue(queue);return item;}

/** Return queue health without exposing payload data. @returns {{pending:number,failed:number,oldestAt:string|null}} Queue summary. */
function getSyncQueueStatus(){const items=readQueue().items;return{pending:items.length,failed:items.filter(x=>x.attempts>0).length,oldestAt:items[0]?.createdAt??null};}

async function execute(item){return item.kind==="module"?(item.module==="dashboard"?syncDashboard():syncModule(item.module)):syncLocalChange(item.module,item.operation,item.value);}

/** Synchronize a change immediately or persist it for background replay. @param {string} moduleName Supported module. @param {string} operation CRUD operation. @param {Object|string} value Record or ID. @returns {Promise<Object>} Sync or queued result. @throws {never} */
async function queueSyncChange(moduleName,operation,value){if(navigator.onLine!==false){const result=await syncLocalChange(moduleName,operation,value);if(result.success)return result;if(!result.pending&&result.code!=="sync/service-unavailable")return result;}enqueue({kind:"change",module:moduleName,operation,value});return{module:moduleName,operation,status:"queued",success:true,pending:true,code:"sync/queued"};}

/** Synchronize a module immediately or persist one coalesced request. @param {string} moduleName Supported module. @returns {Promise<Object>} Sync or queued result. @throws {never} */
async function queueSyncModule(moduleName){if(navigator.onLine!==false){const result=moduleName==="dashboard"?await syncDashboard():await syncModule(moduleName);if(result.success)return result;if(!result.pending&&result.code!=="sync/service-unavailable")return result;}enqueue({kind:"module",module:moduleName});return{module:moduleName,operation:"full",status:"queued",success:true,pending:true,code:"sync/queued"};}

/** Replay the authenticated user's durable queue in creation order. @returns {Promise<Object>} Replay summary. @throws {never} */
async function flushSyncQueue(){if(flushPromise)return flushPromise;flushPromise=(async()=>{if(navigator.onLine===false)return{status:"offline",processed:0,remaining:readQueue().items.length};try{await AuthenticationManager.initialize();}catch(_error){return{status:"authentication-required",processed:0,remaining:readQueue().items.length};}const uid=currentUid();if(!uid)return{status:"authentication-required",processed:0,remaining:readQueue().items.length};const queue=readQueue();let processed=0;for(const item of [...queue.items]){if(item.uid&&item.uid!==uid)continue;const result=await execute(item);if(result.success){queue.items=queue.items.filter(x=>x.id!==item.id);processed+=1;}else{const stored=queue.items.find(x=>x.id===item.id);if(stored){stored.uid=uid;stored.attempts+=1;stored.lastError=result.code??"sync/failed";}if(result.pending)break;}}writeQueue(queue);return{status:queue.items.length?"pending":"synced",processed,remaining:queue.items.length};})().finally(()=>{flushPromise=null;});return flushPromise;}

/** Start online-event and timed background replay. @returns {void} */
function startBackgroundSync(){if(backgroundTimer||typeof window==="undefined")return;window.addEventListener("online",flushSyncQueue);backgroundTimer=window.setInterval(()=>{if(document.visibilityState!=="hidden")void flushSyncQueue();},BACKGROUND_INTERVAL_MS);void flushSyncQueue();}
/** Stop timed replay. @returns {void} */
function stopBackgroundSync(){if(!backgroundTimer||typeof window==="undefined")return;window.clearInterval(backgroundTimer);backgroundTimer=null;window.removeEventListener("online",flushSyncQueue);}

if(typeof window!=="undefined")startBackgroundSync();
export { flushSyncQueue, getSyncQueueStatus, queueSyncChange, queueSyncModule, startBackgroundSync, stopBackgroundSync };
