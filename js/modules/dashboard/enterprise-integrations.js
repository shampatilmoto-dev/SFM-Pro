"use strict";

import { firebaseConfigurationStatus } from "../../firebase/firebase-config.js";
import { syncAll } from "../../firebase/firebase-sync.js";
import { flushSyncQueue, getSyncQueueStatus } from "../../firebase/firebase-sync-queue.js";
import { AssetManager } from "../assets/asset.manager.js";

const HISTORY_KEY = "sfm_cloud_sync_history_v1";
const money = value => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value||0);
function setText(id,value){const node=document.getElementById(id);if(node)node.textContent=value;}
function renderStatus(){const configured=firebaseConfigurationStatus.configured;const online=navigator.onLine;setText("cloudConnectionStatus",online?"Online":"Offline");setText("cloudConfigurationStatus",configured?`Ready (${firebaseConfigurationStatus.source})`:"Configuration required");setText("cloudAuthStatus",globalThis.AuthenticationManager?.isAuthenticated?.()?"Authenticated":"Signed out");const queue=getSyncQueueStatus();setText("cloudQueueStatus",queue.pending?`${queue.pending} pending`:"Up to date");const totals=AssetManager.totals();setText("dashboardAssetValue",money(totals.currentValue));setText("dashboardAssetCount",`${totals.count} registered`);const history=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");setText("cloudLastSync",history[0]?.at?new Date(history[0].at).toLocaleString("en-IN"):"Not synced yet");}
async function runSync(){const button=document.getElementById("cloudSyncNow");if(!button)return;button.disabled=true;button.textContent="Syncing…";await flushSyncQueue();const result=await syncAll();const history=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");history.unshift({at:new Date().toISOString(),status:result.status});localStorage.setItem(HISTORY_KEY,JSON.stringify(history.slice(0,25)));button.disabled=false;button.textContent=result.success?"Synced":"Retry sync";renderStatus();}
document.getElementById("cloudSyncNow")?.addEventListener("click",runSync);window.addEventListener("online",renderStatus);window.addEventListener("offline",renderStatus);document.addEventListener("sfm:authentication-state",renderStatus);renderStatus();
document.addEventListener("sfm:sync-queue-status",renderStatus);
