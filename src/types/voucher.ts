// Shared TypeScript types for voucher management

export type VoucherType = "heartland" | "supermarket" | "climate";

export interface Voucher {
	id: string;
	state: string;
	voucher_value: number;
	type: VoucherType | null;
	merchant_name: string | null;
	last_redeemed_timestamp: string | null;
}

export interface VoucherData {
	campaign: {
		name: string;
		description: string;
		validity_end: string;
		category: string;
		default_vouchers: Array<{
			value: number;
			quantity: number;
			type: VoucherType;
		}>;
	};
	data: {
		vouchers: Voucher[];
	};
}

export interface DenominationBreakdown {
	[key: number]: {
		total: number;
		unused: number;
		redeemed: number;
	};
}

export interface ProcessedVoucherData {
	name: string;
	description: string;
	validityEnd: string;
	heartlandBreakdown: DenominationBreakdown;
	supermarketBreakdown: DenominationBreakdown;
	climateBreakdown: DenominationBreakdown;
}
