"use strict";

const EMIService = {
	loadEMIs() {
		return EMIStorage.load();
	},

	getEMIById(id) {
		return id ? EMIStorage.getById(id) : null;
	},

	createEMI(emi) {
		const validation = EMIEngine.validateEMI(emi);

		if (!validation.valid) {
			return { error: validation.error };
		}

		const timestamp = new Date().toISOString();
		const record = EMIEngine.normalizeEMI({
			...emi,
			id: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
			createdAt: timestamp,
			updatedAt: timestamp
		});
		const saved = EMIStorage.add(record);

		return saved
			? { success: true, emi: saved }
			: { error: "Unable to save EMI." };
	},

	updateEMI(id, emi) {
		const existing = this.getEMIById(id);

		if (!existing) {
			return { error: "EMI record not found." };
		}

		const validation = EMIEngine.validateEMI(emi);

		if (!validation.valid) {
			return { error: validation.error };
		}

		const updatedRecord = EMIEngine.normalizeEMI({
			...existing,
			...emi,
			id: existing.id,
			updatedAt: new Date().toISOString()
		});

		return EMIStorage.update(id, updatedRecord)
			? { success: true, emi: updatedRecord }
			: { error: "Unable to update EMI." };
	},

	deleteEMI(id) {
		return EMIStorage.remove(id)
			? { success: true }
			: { error: "Unable to delete EMI." };
	},

	getSummary() {
		return EMIEngine.calculateSummary(this.loadEMIs());
	},

	searchEMIs(query) {
		return EMIEngine.search(this.loadEMIs(), query);
	}
};